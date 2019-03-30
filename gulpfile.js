// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const inject = require("gulp-inject")
const pkg = require('./package.json');

const htmlclean = require('gulp-htmlclean');
const concat = require('gulp-concat');
var del = require('del');

const paths = {
  src: '.',
  srcHTML: '**/*.html',
  srcCSS: 'css/**/*.css',
  srcJS: 'js/**/*.js',
  dist: 'dist',
  distImg: 'dist/img',
  distIndex: 'dist/index.html',
  distCSS: 'dist/css',
  distJS: 'dist/js'
};

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function (cb) {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/js/bootstrap.min.js',
      './node_modules/bootstrap/dist/css/bootstrap.min.css'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'))
    .pipe(gulp.dest('./dist/vendor/bootstrap'));

  // Font Awesome
  gulp.src([
      './node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    ])
    .pipe(gulp.dest('./vendor/fontawesome-free/css'))
    .pipe(gulp.dest('./dist/vendor/fontawesome-free/css'));
  gulp.src([
      './node_modules/@fortawesome/fontawesome-free/webfonts/**/*',
    ])
    .pipe(gulp.dest('./vendor/fontawesome-free/webfonts'))
    .pipe(gulp.dest('./dist/vendor/fontawesome-free/webfonts'));

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/jquery.min.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'))
    .pipe(gulp.dest('./dist/vendor/jquery'));

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.min.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'))
    .pipe(gulp.dest('./dist/vendor/jquery-easing'));

  // Magnific Popup
  gulp.src([
    './node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    './node_modules/magnific-popup/dist/magnific-popup.css'
    ])
    .pipe(gulp.dest('./vendor/magnific-popup'))
    .pipe(gulp.dest('./dist/vendor/magnific-popup'));

  // Owl carousel
  gulp.src([
    './node_modules/owl.carousel/dist/*.min.js',
    './node_modules/owl.carousel/dist/assets/owl.carousel.min.css'
  ])
  .pipe(gulp.dest('./vendor/owl.carousel'))
  .pipe(gulp.dest('./dist/vendor/owl.carousel'));

  // waitforImages
  gulp.src([
      './node_modules/jquery.waitforimages/dist/*.min.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-waitforimages'))
    .pipe(gulp.dest('./dist/vendor/jquery-waitforimages'));

  cb();

});

gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function () {
  return gulp.src(paths.srcCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.distCSS));
});

gulp.task('js:dist', function () {
  return gulp.src(paths.srcJS)
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.distJS));
});

gulp.task('clean:dist', function () {
  return del([
    'dist/node_modules'
  ]);
});

gulp.task('remove:dist', function () {
  return del([
    'dist'
  ]);
});

// CSS task
function css() {
  return gulp
    .src("./scss/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/email.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

// Tasks
gulp.task("css", css);
gulp.task("js", js);

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

gulp.task("default", gulp.parallel('vendor', 'css', 'js'));

// dev task
gulp.task("dev", function (done) {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*.js", "!./js/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
  browsersync.init({
    server: {
      baseDir: "./"
    }
  });
  done();
});

gulp.task('copy:dist', gulp.parallel('vendor', 'html:dist', 'css:dist', 'js:dist', function () {
  console.log("Copy dist Success");
  return gulp.src([
      './img/**/*',
    ])
    .pipe(gulp.dest('./dist/img'))
}));

gulp.task('build', gulp.series('remove:dist', 'copy:dist', 'clean:dist'));