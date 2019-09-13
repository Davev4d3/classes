const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const ManifestPlugin = require('webpack-manifest-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

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

  new ManifestPlugin({
    fileName: 'asset-manifest.json',
    seed: [
      'index.html',
      'roboto-light.woff',
      'roboto-thin.woff'
    ].reduce((obj, v) => {
      obj[v] = v;
      return obj;
    }, {})
  })
];

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const cssExtractor = 'style-loader';
  if (isProduction) {
    plugins.push(
      new SWPrecacheWebpackPlugin({
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: 'service-worker.js',
        minify: true,
        navigateFallback: 'public/index.html',
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/, /main\.appcache$/],

        mergeStaticsConfig: true,
        stripPrefix: 'public',
        staticFileGlobs: ['public/fonts/**.*', 'public/index.html', 'public/icons/favicon.ico']
      })
    )
  }

  return {
    context: path.join(__dirname, 'app'),
    entry: './index',
    output: {
      path: PATHS.SERVER_BASE,
      filename: 'app.js'
    },

    devtool: isProduction ? false : 'source-map',

    optimization: {
      minimizer: isProduction ? [
        new UglifyJSPlugin({
          sourceMap: !isProduction,
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
        },

        {test: /\.(woff|woff2|eot|ttf)$/, loader: 'null-loader'}
      ]
    },

    resolve: {
      extensions: ["*", ".js", ".json", ".jsx"],
      modules: ['src', 'node_modules']
    },
  };
};
