const path = require('path');
const merge = require('webpack-merge');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const TerserPlugin = require('terser-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false
            }
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: false,
              config: {
                path: `${__dirname}/postcss.config.js`,
                ctx: {
                  env: 'production'
                }
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
        sourceMap: false
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
      chunkFilename: '[id].css'
    }),
    new CompressionPlugin({
      test: /\.(html|css|js)(\?.*)?$/i // only compressed html/css/js, skips compressing sourcemaps etc
    }),
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      gifsicle: {
        // lossless gif compressor
        optimizationLevel: 9
      },
      pngquant: {
        // lossy png compressor, remove for default lossless
        quality: '75'
      },
      plugins: [
        imageminMozjpeg({
          // lossy jpg compressor, remove for default lossless
          quality: '75'
        })
      ]
    }),
    new CopyPlugin([{ from: 'src/images/iconpng/', to: 'images/iconpng/' }]),
    new CopyPlugin([{ from: 'src/uploadedPhotos/', to: 'uploadedPhotos/' }]),
    new FaviconsWebpackPlugin({
      logo: './src/images/pusicov-logo.svg',
      favicons: {
        appName: 'Covid19 Risk Map',
        appDescription: 'Web Based Desease Monitoring GIS ',
        developerName: 'fikriaditya',
        developerURL: null, // prevent retrieving from the nearest package.json
        background: '#fafafa',
        theme_color: '#FFA8A8',
        pixel_art: false,
        icons: {
          android: {
            offset: 15,
            background: true
          },
          appleIcon: {
            offset: 15,
            background: true
          },
          appleStartup: {
            offset: 20,
            background: true,
            mask: false,
            overlayGlow: false,
            overlayShadow: false
          },
          coast: false,
          yandex: false
        }
      },
      icons: {
        twitter: true,
        windows: true
      }
    }),
    new OfflinePlugin()
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
});
