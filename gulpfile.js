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
 
gulp.task('sass:watch', () => {
	gulp.watch('./stylesheets/*.scss', gulp.series( 'sass' ));
});

gulp.task('watch', gulp.parallel('livereload', 'sass:watch', 'js:watch'));

gulp.task('default', gulp.parallel('sass', 'js'));
