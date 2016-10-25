
var path = require('path');

module.exports = {
    entry: './js/frontend/entry.tsx',
    cache: true,
    output: {
        filename: 'app.js',
        path: path.resolve('public/js')
    },
    resolve: {
        extensions: [ '', '.js', '.ts', '.tsx' ]
    },
    module: {
        preLoaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ],
        loaders: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [ ]
                }
            }
        ]
    },
    devtool: 'source-map'
}
