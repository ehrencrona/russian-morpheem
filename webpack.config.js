module.exports = {  
  entry: './js/frontend/entry.tsx',
  cache: true,
  output: {
      filename: 'app.js',
      path: '/home/ehrencrona/morpheem-jp/public/js'
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
		presets: ['es2015']
            }
	}
    ]
  },
  devtool: 'source-map'
}
