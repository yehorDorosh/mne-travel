'use strict';

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const atImport = require('postcss-import'); // @import syntax for postcss
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano'); // minify css
const debug = require('gulp-debug'); // .pipe(debug({ title: 'src' })) t
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if'); // condition operator IF
const del = require('del'); // the module delete folder & files
const postcssPresetEnv = require('postcss-preset-env'); // convert postcss to css
const rename = require('gulp-rename'); // rename *.pcss to *.css
const postcssBEM = require('postcss-bem-fix');
const postcssNested = require('postcss-nested'); // add to pcss syntax "&"
const pxtorem = require('postcss-pxtorem'); // convert px to rem
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const minify = require('gulp-minify');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

gulp.task('styles', function () {
  var plugins = [
    atImport,
    postcssBEM({
      style: 'bem',
      separators: {
        modifier: '--'
      },
      shortcuts: {
        component: 'b',
        descendent: 'e',
        modifier: 'm'
      }
    }),
    postcssNested,
    postcssPresetEnv({
      stage: 1,
      features: {
        'nesting-rules': true
      },
      autoprefixer: false,
      Browserslist: 'last 2 versions'
    }),
    autoprefixer,
    pxtorem({
      replace: true
    })
  ];

  if (!isDevelopment) {
    plugins.push(cssnano);
  }
  return gulp.src('src/css/main.pcss')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(postcss(plugins))
    .pipe(rename('main.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
    .pipe(gulp.dest('dest/css'));
});

gulp.task('clean', function () {
  return del('dest');
});

gulp.task('html', function () {
  return gulp.src('src/html/*', { since: gulp.lastRun('html') })
  // { since: - filtrate files each changed from set date.
  // gulp.lastRun('assets') return last date of selected task
    .pipe(gulp.dest('dest/html'));
});

gulp.task('move-data', function () {
  del('dest/data');
  return gulp.src('src/data/**/*.*')
    .pipe(gulp.dest('dest/data'));
});

gulp.task('images', function () {
  del('dest/img');
  return gulp.src('src/img/**/*.*')
    .pipe(
      gulpIf(
        !isDevelopment,
        imagemin([
          imagemin.jpegtran({
            progressive: true
          }),
          imagemin.svgo({
            plugins: [
              {
                removeViewBox: false
              },
              {
                removeDimensions: false
              },
              {
                cleanupIDs: false
              }
            ]
          }),
          pngquant({
            quality: [0.5, 1.0]
          }),
          mozjpeg({
            quality: 80
          })
        ])
      )
    )
    .pipe(gulp.dest('dest/img'));
});

gulp.task('scripts', function () {
  del('dest/js');
  return gulp.src('src/js/**/*.*')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('main.js'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('')))
    .pipe(gulpIf(!isDevelopment, minify({
      ext: {
        min: '.js'
      },
      noSource: true
    })))
    .pipe(gulp.dest('dest/js'));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('styles', 'html', 'images', 'scripts', 'move-data'))
);

gulp.task('watch', function () {
  gulp.watch('src/css/**/*.*', gulp.series('styles'));
  gulp.watch('src/js/**/*.*', gulp.series('scripts'));
  gulp.watch('src/html/**/*.*', gulp.series('html'));
  gulp.watch('src/img/**/*.*', gulp.series('images'));
  gulp.watch('src/data/**/*.*', gulp.series('data'));
});

gulp.task('dev', gulp.series('build', 'watch'));
