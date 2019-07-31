'use strict';

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const atImport = require('postcss-import'); // @import syntax for postcss
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano'); // minify css
const debug = require('gulp-debug'); // .pipe(debug({ title: 'src' }))
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if'); // condition operator IF
const del = require('del'); // the module delete folder & files
const postcssPresetEnv = require('postcss-preset-env'); // convert postcss to css
const rename = require('gulp-rename'); // rename *.pcss to *.css
const postcssBEM = require('postcss-bem-fix');
const postcssNested = require('postcss-nested'); // add to pcss syntax "&"
const pxtorem = require('postcss-pxtorem'); // convert px to rem

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
  return gulp.src('src/css/styles.pcss')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(postcss(plugins))
    .pipe(rename('styles.css'))
    .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
    .pipe(gulp.dest('dest/css'));
});

gulp.task('clean', function () {
  return del('dest');
});

gulp.task('assets', function () {
  return gulp.src(['src/{img,js}/*', 'src/*.html'], { since: gulp.lastRun('assets') })
  // { since: - filtrate files each changed from set date.
  // gulp.lastRun('assets') return last date of selected task
    .pipe(gulp.dest('dest'));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('styles', 'assets'))
);

gulp.task('watch', function () {
  gulp.watch('src/css/**/*.*', gulp.series('styles'));
  gulp.watch(['src/{img,js}/*', 'src/*.html'], gulp.series('assets'));
});

gulp.task('dev', gulp.series('build', 'watch'));
