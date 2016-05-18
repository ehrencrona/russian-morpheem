module.exports = {  
  entry: './js/frontend/entry.tsx',
  cache: true,
  output: {
    filename: 'public/js/app.js'
  },
  resolve: {
    extensions: [ '', '.js', '.ts', '.tsx' ]
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  devtool: 'source-map'
}