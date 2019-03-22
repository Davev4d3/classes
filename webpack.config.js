const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const AppCachePlugin = require('appcache-webpack-plugin');
const fs = require('fs');

const PATHS = {
  DIST: path.resolve(__dirname, 'unset'),
  JS: path.resolve(__dirname, 'unset'),
  SERVER_BASE: path.join(__dirname, 'public')
};

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
  }),
  // new webpack.optimize.(),
  // new webpack.optimize.OccurenceOrderPlugin(false),
  new AppCachePlugin({
    output: 'main.appcache',
    cache: fs.readdirSync('public/fonts')
      .filter(f => f[0] != '.')
      .map(f => 'fonts/' + f)
      .concat(['main.css'])
  })
];

module.exports = env => {
  const isProduction = process.env.NODE_ENV !== 'development' && env !== 'dev';
  // const cssExtractorPlugin = isProduction ? require('mini-css-extract-plugin') : null;
  const cssExtractor = isProduction ? 'style-loader' /* cssExtractorPlugin.loader */ : 'style-loader';

  return {
    context: path.join(__dirname, 'app'),
    entry: './index',
    output: {
      path: PATHS.SERVER_BASE,
      filename: 'app.js'
    },

    devtool: 'source-map',

    optimization: {
      minimizer: isProduction ? [
        new UglifyJSPlugin({
          sourceMap: true,
          uglifyOptions: {
            compress: {
              inline: false
            }
          }
        })
      ] : undefined
    },

    plugins: isProduction ? plugins : plugins,

    devServer: {
      host: '0.0.0.0',
      port: 5600,
      contentBase: PATHS.SERVER_BASE,
      hot: true,
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            cssExtractor,
            {
              loader: 'css-loader',
              options: {
                sourceMap: false,
                modules: true,
                localIdentName: '[name]__[local]--[hash:base64]'
              }
            },
            {
              loader: "postcss-loader",
              options: {
                autoprefixer: {
                  browsers: ["last 2 versions"]
                },
                plugins: [
                  require('autoprefixer'),
                  require('cssnano'),
                  require('postcss-inline-svg'),
                  require('precss')
                ],
                sourceMap: false
              }
            }
          ]
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },

    /* postcss: function () {
      var autoprefixer = require('autoprefixer'),
        precss = require('precss'),
        inlinesvg = require('postcss-inline-svg'),
        cssnano = require('cssnano');

      return [
        precss(),
        inlinesvg(),
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
      ];
    } */
  };
};