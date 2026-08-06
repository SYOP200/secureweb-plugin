const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    filename: 'secureweb.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'SecureWeb',
      type: 'umd'
    },
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      crypto: false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  target: 'web',
  externals: {}
};