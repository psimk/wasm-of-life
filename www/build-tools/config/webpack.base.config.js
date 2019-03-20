const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const projectRoot = path.resolve(__dirname);
const dist = path.resolve(projectRoot, 'dist');

module.exports = {
  entry: './index.ts',
  output: {
    path: '/dist',
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new WasmPackPlugin({
      crateDirectory: '../',
      // forceMode: 'production',
      withTypeScript: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.txt$/i,
        use: 'raw-loader',
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/experimental',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader?name=images/[name].[ext]',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.wasm', '.js' ],
  },
};
