const
  gulp = require('gulp'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  babel = require('gulp-babel'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  eslint = require('gulp-eslint'),
  rev = require('gulp-rev'),
  rev_collector = require('gulp-rev-collector'),
  sequence = require('gulp-sequence');

gulp.task('styles-dev', () => {
  return gulp.src('app/assets/stylesheets/application.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/public/assets/stylesheets'));
});

gulp.task('styles-build', () => {
  return gulp.src('app/assets/stylesheets/application.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('app/public/assets/stylesheets'));
});

gulp.task('scripts-dev', () => {
  return browserify({ entries: 'app/assets/javascripts/application.js', debug: true })
    .transform(babelify)
    .bundle()
    .on('error', err => console.log(err))
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/public/assets/javascripts'));
});

gulp.task('scripts-build', () => {
  return browserify({ entries: 'app/assets/javascripts/application.js' })
    .transform(babelify)
    .bundle()
    .on('error', err => console.log(err))
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('app/public/assets/javascripts'));
});

gulp.task('scripts-lint', () =>{
  return gulp.src('app/assets/javascripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('fonts', () => {
  return gulp.src('app/assets/fonts/**/*')
    .pipe(gulp.dest('app/public/assets/fonts'));
});

gulp.task('images', () => {
  return gulp.src('app/assets/images/**/*')
    .pipe(gulp.dest('app/public/assets/images'));
});

gulp.task('clean', () => {
  return gulp.src('app/public/assets/*', { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('watch', () => {
  gulp.watch('app/assets/stylesheets/**/*.scss', ['styles-dev']);
  gulp.watch('app/assets/javascripts/**/*.js', ['scripts-dev']);
});

gulp.task('lint', ['scripts-lint']);

gulp.task('rev', ['rev-assets'], () => {
  return gulp.src(['app/public/assets/rev-manifest.json', 'app/public/assets/**/*.{css,js}'])
    .pipe(rev_collector())
    .pipe(gulp.dest('app/public/assets'));
});

gulp.task('rev-assets', () => {
  return gulp.src('app/public/assets/**/!(*.{css,js})')
    .pipe(rev())
    .pipe(gulp.dest('app/public/assets'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('app/public/assets'));
});

gulp.task('dist', (cb) => {
  var tasks = ['clean', 'fonts', 'images', 'styles-build', 'scripts-build', 'rev'];
  tasks.push(cb);
  return sequence.apply(this, tasks);
});

gulp.task('default', (cb) => {
  var tasks = ['clean', 'fonts', 'images', 'styles-dev', 'scripts-dev', 'watch'];
  tasks.push(cb);
  return sequence.apply(this, tasks);
});
