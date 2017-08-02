//--------------------------------------------------//
// Todo
//--------------------------------------------------//

    // * responsive images
    // * string replacements
    // * setup basic files

//--------------------------------------------------//
// Options
//--------------------------------------------------//

let options = {

    // Uncompressed production files are compiled to:
    source_folder : 'prod',
    // Distribution files are compiled to:
    destination_folder : 'dist',

    // lastest versions of browsers to support
    autoprefixer : 4,

    // Name of destination_folder/css/filename.css
    main_css_file : 'main.css',

    // Sourcemaps
    sourcemaps : true,

    // HTML minify
    enable_htmlmin : true,
    htmlmin : {
        collapseWhitespace: true
    },

    // Javascript
    js_concat_all : true,
    js_concat_name : 'app.js',
    // concats these if js_concat_all = false
    js_concat_some : ['js/filename1.js', 'js/filename2.js', 'js/etc.js'],

    extensions : '{png,gif,jpg,jpeg,PNG,GIF,JPG,JPEG}',
    images : {
        '**/*.*': [
            {
                width: 1920,
                suffix: '-1920'
            }, {
                width: 1800,
                suffix: '-1800'
            }, {
                width: 1680,
                suffix: '-1680'
            }, {
                width: 1440,
                suffix: '-1440'
            }, {
                width: 1280,
                suffix: '-1280'
            }, {
                width: 1024,
                suffix: '-1024'
            }, {
                width: 800,
                suffix: '-800'
            }, {
                width: 640,
                suffix: '-640'
            }, {
                width: 480,
                suffix: '-480'
            }, {
                width: 320,
                suffix: '-320'
            }
        ]
    },
};

//--------------------------------------------------//
// Require
//--------------------------------------------------//

const gulp = require('gulp');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const pump = require('pump');

// Require sharp: npm install sharp
const responsive = require('gulp-responsive-images');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');

// Gulp cached and gulp remember for Incremental rebuilding
const cached = require('gulp-cached');

// Remember files, for faster compiler
const remember = require('gulp-remember');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');

const watch = require('gulp-watch');
const livereload = require('gulp-livereload');
// var sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// Replace string in files
const replace = require('gulp-replace');

// Gulp Utilities - Console log
const gutil = require('gulp-util');

const htmlmin = require('gulp-htmlmin');

// Paths
let paths = {
    scss: 'src/scss/**/*',
    js: 'src/js/**/*',
    html: 'src/html/**/*',
    scale: 'src/scale/images/**/*',
    images: 'src/images/'
};

//--------------------------------------------------//
// Production Tasks
//--------------------------------------------------//

// Scss / css
gulp.task('scss', function() {
    return gulp.src(paths.scss+'.scss')
            //Compile Scss
            .pipe(sass().on('error', sass.logError))

            // sourcemaps start
            .pipe(gulpif(options.sourcemaps, sourcemaps.init()))

            // Add autoprefixer
            .pipe(postcss([
                autoprefixer({
                    browsers: ['last '+options.autoprefixer+' versions']
                }),
            ]))

            // Write sourcemaps
            .pipe(gulpif(options.sourcemaps, sourcemaps.write()))

            // Concat to app.css
            //.pipe(concat('app.css'))

            // Deliver to src/css
            .pipe(gulp.dest(options.source_folder+'/css/')).on('end', function() {
                gutil.log('Source compiled');
            })
});


gulp.task('js', function() {
    return gulp.src(gulpif(options.js_concat_all, paths.js+'.js', options.js_concat_some))
        .pipe(concat(options.js_concat_name))
        .pipe(gulp.dest(options.source_folder+'/js/'));
});

gulp.task('html', function(){
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest(options.source_folder+'/'));
});

// Churn deeze images
gulp.task('rs-img', function () {
    var dest = options.source_folder+'/images';

    return gulp.src(paths.scale)
        .pipe(responsive({
            '*.jpg': [
                {
                    width: 1920,
                    suffix: '-1920',
                }, {
                    width: 1800,
                    suffix: '-1800',
                },
            ],
        }).on('error', function() {
            gutil.log('hei');
        }))
        .pipe(gulp.dest('prod/images'))
});


//--------------------------------------------------//
// Distribution Tasks
//--------------------------------------------------//

gulp.task('dist_js', function() {
    return gulp.src(options.source_folder+'/js/'+options.js_concat_name)
        .pipe(uglify())
        .pipe(gulp.dest(options.destination_folder+'/js/'));
});


gulp.task('dist_css', function() {
    return gulp.src(options.source_folder+'/css/**/*.css')
        // Css concatination
        .pipe(concat(options.main_css_file))

        // Minify css
        .pipe(cssnano())

        // Deliver to dist/css
        .pipe(gulp.dest(options.destination_folder+'/css/')).on('end', function() {
            gutil.log('Source -> Dist Concat');
        })

        // Reload
        .pipe(livereload());
});

gulp.task('dist_html', function(){
    return gulp.src(options.source_folder+'/**/*.html')
        .pipe(gulpif(options.enable_htmlmin, htmlmin(options.htmlmin)))
        .pipe(gulp.dest(options.destination_folder+'/'));
});

//--------------------------------------------------//
// Task Bundles
//--------------------------------------------------//

// Watch deeze folders
gulp.task('watch', function() {
    gulp.watch(paths.scss, ['scss']);
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.scale, ['rs-img']);
    gulp.watch('src/**/*.html', ['html']);
    // responsive img
});

// Default (when i gulp)
gulp.task('img', ['rs-img']);

// Clear production and distribution folder
gulp.task('clear', function() {
    return gulpif(options.source_folder !== 'src', del([options.source_folder+'**/*', options.source_folder, options.destination_folder+'**/*', options.destination_folder]));
});

gulp.task('source', ['scss', 'js', 'html']);
gulp.task('default', ['watch', 'source']);


// Distribution task
gulp.task('dist', ['default', 'dist_css', 'dist_html', 'dist_js']);
