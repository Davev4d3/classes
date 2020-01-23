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
    APP_VERSION: JSON.stringify(require('./package.json').version),
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

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: false,
      modules: true,
      localIdentName: '[name]__[local]--[hash:base64]'
    }
  };
  const autoprefixer = isProduction ? require('autoprefixer') : null;
  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      autoprefixer: {
        browsers: ['last 2 versions']
      },
      plugins: [
        autoprefixer
      ].filter(Boolean),
      sourceMap: false
    }
  };
  const postCssLoaderCssNano = {
    ...postCssLoader,
    options: {
      ...postCssLoader.options,
      plugins: [
        autoprefixer,
        require('cssnano'),
        require('postcss-inline-svg'),
        require('precss')
      ].filter(Boolean)
    }
  };

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
      proxy: {
        '/api': {
          target: 'https://lordhelix.tk',
          changeOrigin: true,
          secure: false
        }
      },
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            cssExtractor,
            cssLoader,
            postCssLoaderCssNano,
          ].filter(Boolean)
        },
        {
          test: /\.scss$/,
          use: [
            cssExtractor,
            cssLoader,
            postCssLoader,
            {loader: 'sass-loader', options: {sourceMap: !isProduction}},
          ].filter(Boolean)
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
