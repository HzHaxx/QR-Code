import path from 'path' // doesn't need to be installed, it's part of node
import fs from 'fs' // doesn't need to be installed, it's part of node
import { glob } from 'glob'
import { src, dest, watch, series } from 'gulp' 
import * as dartSass from 'sass' 
import gulpSass from 'gulp-sass' 
import sharp from 'sharp' 
import plumber from 'gulp-plumber' 

const sass = gulpSass(dartSass);

const paths = { 
    scss: 'src/scss/**/*.scss'
}

// * Function to compile scss to css
export function css( done ) { 
    src(paths.scss, {sourcemaps: true}) 
        .pipe( plumber() ) 
        .pipe( sass({ outputStyle: 'compressed' }).on('error', sass.logError) ) 
        .pipe( dest('./build/css', {sourcemaps: '.'}) ); 
    done()
}

// * Functions to process images 
export async function imagenes(done) { 
    const srcDir = './src/img';
    const buildDir = './build/img';
    const images =  await glob('./src/img/**/*') 

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)

    if (extName.toLowerCase() === '.svg') {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        fs.copyFileSync(file, outputFile);
    } else {
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
        const options = { quality: 80 };

        sharp(file).jpeg(options).toFile(outputFile);
        sharp(file).webp(options).toFile(outputFileWebp);
        sharp(file).avif().toFile(outputFileAvif);
    }
}

// * Function to watch changes in scss files and images
export function dev() {
    watch( paths.scss, css );
    watch('src/img/**/*.{png,jpg}', imagenes) 
}

    
export default series( css, imagenes, dev )
export const build = series(css, imagenes); // * Build task important for Netlify