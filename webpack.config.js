const {
  resolve,
  join,
} = require('path');

// const NodePackage = require('./package.json');

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// const module_resolve = require('resolve');

// const outputPath = resolve('.');
// const thingsShellModulePath = __dirname;
// const externModulesPath = resolve(__dirname, 'node_modules');

module.exports = {
  mode: 'production',
  entry: {
    "things-scene-baidu": ['./src/index.js']
  },
  output: {
    path: resolve('./dist'),
    filename: '[name].js',
  },
  resolve: {
    modules: ['./node_modules']
  },
  resolveLoader: {
    modules: ['./node_modules']
  },
  externals: {
    "@hatiolab/things-scene": "scene"
  },
  optimization: {
    minimize: true,
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'es2015', {
                targets: {
                  browsers: ['last 2 Chrome versions', 'Safari 10']
                },
                debug: true
              }
            ]
          ],
          plugins: []
        }
      }
    }, {
      //   test: /\.template$/,
      //   use: ['text-loader']
      // }, {
      //   test: /\.html$/,
      //   use: [{
      //     loader: 'babel-loader'
      //   },
      //   {
      //     loader: 'polymer-webpack-loader'
      //   }]
      // }, {
      //   test: /\.css$/,
      //   use: ['text-loader']
      // }, {
      //   test: /\.postcss$/,
      //   use: ['text-loader', 'postcss-loader']
      // }, {
      test: /\.(gif|jpe?g|png)$/,
      loader: 'url-loader?limit=25000',
      query: {
        limit: 10000,
        name: '[path][name].[hash:8].[ext]'
      }
    }, {
      test: /\.(obj|mtl|tga|3ds|max|dae)$/,
      use: [{
        loader: 'file-loader',
        options: {}
      }]
    }]
  },
  plugins: [
    new UglifyJsPlugin({
      test: /\-min\.js$/
    })
  ],
  devtool: 'cheap-module-source-map'
}
