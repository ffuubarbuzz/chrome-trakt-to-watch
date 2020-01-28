// generated on 2017-12-09 using generator-chrome-extension 0.7.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import {spawn} from 'child_process';
import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/styles/**',
    'app/scripts/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  },
  parserOptions: {
    sourceType: 'module'
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.error(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: true,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel')
    .pipe(webpackStream(require('./webpack.config.js'), webpack)
      .on('error', function (err) {
        console.error(err);
        this.emit('end');
      }))
    .pipe(gulp.dest('app/scripts/'))
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('vue', done => {
  spawn('./node_modules/.bin/vue-devtools');
  done();
})

gulp.task('watch', gulp.series('lint', 'babel', 'vue', done => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/scripts/**/*.vue',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload);

  gulp.watch(['app/scripts.babel/**/*.js', 'app/scripts.babel/**/*.vue'], gulp.series('lint', 'babel'));
  done();
}));

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
      .pipe($.zip('chrome ext-' + manifest.version + '.zip'))
      .pipe(gulp.dest('package'));
});

gulp.task('build', gulp.series(
    'lint', 'babel', 'chromeManifest',
    gulp.parallel('html', 'images', 'extras'),
    'size')
);

gulp.task('upload', () => {
  var manifest = require('./dist/manifest.json');
  console.log('foo')
  console.log(process.env.CLIENT_ID)
  console.log('foo')

  const webStore = chromeWebstoreUpload({
    extensionId: 'lenehnfieohimgadpmnphhbgikfnoale',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  });
  webStore.fetchToken().then(token => {
    const myZipFile = fs.createReadStream('package/chrome ext-' + manifest.version + '.zip');
    webStore.uploadExisting(myZipFile, token).then(res => {
        if (res.uploadState !== 'SUCCESS') {
          console.error(res.itemError)
        } else {
          webStore.publish('default', token).then(res => {
            console.log(res.status);
          });
        }
    });
  });
});

gulp.task('default', gulp.series('clean', 'build'));

gulp.task('release', gulp.series('build', 'package', 'upload'));
