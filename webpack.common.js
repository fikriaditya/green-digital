const path = require('path');
// const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
// const layerData = require('./dummy/layerData.json');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader'
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader?'
          },
          {
            loader: 'pug-html-loader?pretty&exports=false'
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[name].[ext]',
              outputPath: 'images/',
              publicPath: '/images/'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].json',
              outputPath: 'dummy/',
              publicPath: 'dummy/'
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WriteFilePlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'src', 'robots.txt'),
        to: path.resolve(__dirname, 'dist', 'robots.txt')
      }
    ]),
    new HtmlWebpackPlugin({
      title: 'forest-map',
      filename: 'index.html',
      template: './src/index-2.pug',
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      title: 'forest-home-page',
      filename: 'homepage.html',
      template: './src/homepage.pug',
      inject: 'head'
    }),
    new HtmlWebpackPlugin({
      title: 'tris-404-page',
      filename: '404.html',
      template: './src/404.html',
      inject: 'head'
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      // eslint-disable-next-line consistent-return
      as(entry) {
        if (/\.(woff|woff2|ttf|otf)$/.test(entry)) return 'font';
      },
      fileWhitelist: [/\.(woff|woff2|ttf|otf)$/],
      include: 'allAssets'
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    })
  ],
  externals: {
    $: 'jquery',
    jquery: 'jQuery',
    'window.$': 'jquery'
  }
};
