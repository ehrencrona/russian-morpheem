'use strict';
 
let gulp = require('gulp');
let sass = require('gulp-sass');
let livereload = require('gulp-livereload');
var webpack = require('webpack-stream');

require('./gulp-webpack.js')

gulp.task('sass', () => {
	return gulp.src('./stylesheets/*.scss')
    	.pipe(sass().on('error', sass.logError))
    	.pipe(gulp.dest('./public/stylesheets'))
	    .pipe(livereload());
});

gulp.task('livereload', () => {
	livereload.listen();
})
 
gulp.task('sass:watch', function () {
	gulp.watch('./stylesheets/*.scss', [ 'sass' ]);
});

gulp.task('watch', [ 'livereload', 'sass:watch', 'js:watch' ]);

gulp.task('default', [ 'sass', 'js' ]);
