module.exports = {  
  entry: './js/frontend/entry.tsx',
  output: {
	filename: 'public/js/app.js'
  },
  resolve: {
	extensions: [ '', '.ts', '.tsx' ]
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.tsx$/, loader: 'jsx-loader' }
    ]
  }
}