'use strict'

const gulp = require('gulp');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const DefinePlugin = webpack.DefinePlugin;
const optimize = webpack.optimize;
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const rootDir = process.cwd();
const livereload = require('gulp-livereload');

const webpackConfig = require(`${rootDir}/webpack.config.js`);
const notifier = require('node-notifier');
const path = require('path');

let iconPath = path.join(__dirname, '../7nxt-logo.png');

function notifyErrors(errors) {
    let message = '';
    let title = 'Javascript build failed.'

    try {
        message = errors.map((stack) => {
	    console.error(stack.split('\n').slice(0,10).join('\n'));

            // the first non-indented line after the file name is the real error
            for (let line of stack.split('\n').slice(1)) {
                if (line[0] != ' ') {
                    return line;
                }
            }
        }).join(', ');

        title = errors.map((stack) => {
            let filename = stack.split('\n')[0];

            return filename.match(/[^\/\\]*$/)[0];
        }, '').join(', ');
    }
    catch (e) {
        console.error(e.stack);
    }

    notifier.notify({ title: title, message: message, icon: iconPath });
}

let lastWasFailure;

gulp.task('js', (done) => {
    return gulp.src(webpackConfig.entry)
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('js:watch', (done) => {
    webpackConfig.watch = true;

    // gulp-stream has problems with its error behavior so we use "raw" webpack
    // https://github.com/shama/webpack-stream/issues/34
    let compiler = webpack(webpackConfig, function (err, stats) {
        let jsonStats = stats.toJson() || {};
        let errors = jsonStats.errors || [];

        if (errors.length) {
            notifyErrors(errors);
            lastWasFailure = true;
        }
        else if (lastWasFailure) {
            lastWasFailure = false;

            notifier.notify({ title: 'Javascript build', message: 'Build successful again.' });
        }
    });

    // webpack wraps the compiler when watching.
    compiler = compiler.compiler;

    compiler.plugin('after-emit', function (compilation, callback) {
        Object.keys(compilation.assets).forEach(function (outname) {
            if (compilation.assets[outname].emitted) {
                let path = require('path').join(compiler.outputPath, outname);

                console.log('Built ' + path);
                livereload.changed(path)
            }
        });
        callback();
    });
});

