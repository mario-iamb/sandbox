var gulp = require('gulp');
var util = require('gulp-util');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var multiDest = require('gulp-multi-dest');
var nunjucksRender = require('gulp-nunjucks-render');
var cssnano = require('gulp-cssnano');
var include = require('gulp-include');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');

var babel = require('gulp-babel');
var babelify = require("babelify");
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
var reload = browserSync.reload;
var critical = require('critical');

var localDevUrl = 'http://localhost:8888/sandbox/';

var dimensionSettings = [{
    width: 639,
    height: 667
}, {
    width: 641,
    height: 1024
}, {
    width: 1024,
    height: 1366
}, {
    width: 1025,
    height: 1366
}, {
    width: 1441,
    height: 900
}, {
    width: 1921,
    height: 1175
}];


/* Build CSS */
gulp.task('sass', function() {
    return gulp.src('./packages/scss/*.scss')
		.pipe(sass({
			style: 'compressed',
			errLogToConsole: true,
			onError: function(err) {
				return notify().write(err);
			}
		}))
		.pipe(sourcemaps.init())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(cssnano())
		.pipe(gulp.dest('../assets/css'))
        .pipe(reload({stream:true}));
});  

/* Build JS */
gulp.task('js', function() {
	return browserify('./packages/js/script.js')
		.transform("babelify", { presets: ["es2015", 'stage-2'] })
        .bundle()
		.pipe(source('script.js'))
		.pipe(buffer())
        .pipe(sourcemaps.init())
		.pipe(gulp.dest('../assets/js'));
		
});

gulp.task('critical', function (cb) {

});


gulp.task('default', ['sass','js'], function () {
	browserSync.init({
		files: ['{site}/**/*.php', '*.php'],
 		proxy: localDevUrl,
	});
	gulp.watch('./packages/scss/**/*', ['sass']);
	gulp.watch('./packages/js/**/*', ['js']);
    gulp.watch(['*.twig', 'views/**/*.twig'], {cwd: '..'}, reload);
});