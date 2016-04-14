module.exports = {  
  entry: './js/frontend/entry.tsx',
  output: {
	filename: 'public/js/app.js'
  },
  resolve: {
	extensions: [ '', '.js', '.ts', '.tsx' ]
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  devtool: 'source-map'
  
}