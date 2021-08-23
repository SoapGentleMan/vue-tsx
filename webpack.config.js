const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const isProd = process.env.NODE_ENV !== 'development';
const isRelease = process.env.NODE_ENV === 'release';

module.exports = function makeWebpackConfig() {
  let config = {};

  config.mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

  config.resolve = {
    modules: ['node_modules'],
    extensions: ['.vue', '.ts', '.js']
  };

  config.entry = {};

  const pageArr = fs.readdirSync('./src/pages');
  pageArr.forEach(item => {
    config.entry[item] = './src/pages/' + item + '/main.ts'
  });

  config.output = {
    path: path.join(__dirname, './dist'),
    publicPath: isProd ? 'http://ynshowway.cn/' : '/',
    filename: isProd ? 'js/[name].[hash].js' : '[name].bundle.js',
    chunkFilename: isProd ? 'js/[name].[hash].js' : '[name].bundle.js'
  };

  config.devtool = isProd ? 'hidden-source-map' : 'inline-source-map';

  config.module = {
    rules: [
      // 文件检查
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          failOnHint: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.(vue|jsx?)$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          failOnWarning: true
        },
        exclude: /node_modules/
      },
      // 文件检查结束
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 下面是为了tsx写法准备
      {
        test: /\.tsx?$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {appendTsxSuffixTo: [/\.vue$/]}
          }
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {modules: true, sourceMap: !isProd}},
          {loader: 'postcss-loader'},
          {loader: 'sass-loader'}
        ]
      },
      // tsx写法准备结束
      // 下面是为了原始的vue写法准备
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // {loader: 'css-loader', options: {modules: true, sourceMap: !isProd}},    // 带css module版本，style标签上需加上module
          {loader: 'css-loader', options: {sourceMap: !isProd}},
          {loader: 'postcss-loader'}
        ],
        exclude: [/global\.css/, /node_modules/]
      },
      // 原始写法准备结束
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: []
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {sourceMap: !isProd}},
          {loader: 'postcss-loader'}
        ],
        include: [/global\.css/]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader'}
        ],
        include: [/node_modules/]
      },
      {
        test: /\.(ico|woff|woff2|ttf|eot|otf)(\?.+)?$/,
        use: [
          {loader: 'file-loader'}
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 15000,
              outputPath: isProd ? 'css/img' : ''
            }
          }
        ],
        exclude: []
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000000,
              outputPath: isProd ? 'css/img' : ''
            }
          }
        ],
        include: []
      }
      // {
      //   test: /\.html/,
      //   use: [
      //     {loader: 'html-loader'}  // 用了这个没法使用htmlwebpackplugin的变量替代功能，可不用，要用对test做更严格的匹配，避免对index.html进行load
      //   ]
      // }
    ]
  };

  config.externals = {};

  config.plugins = [];

  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: isProd ? 'css/[name].[hash].css' : '[name].bundle.css'
    }),

    ...pageArr.map(item => new HtmlWebpackPlugin({
      filename: item + '.html',
      template: './src/public/index.html',
      inject: 'body',
      chunks: ['lib', 'common', 'polyfill', item],
      favicon: './src/public/favicon.ico'
    })),

    new webpack.DefinePlugin({
      CLIENT: JSON.stringify(isProd ? '.' : ''),
      SERVER: JSON.stringify(isProd ? 'http://ynshowway.cn:8081' : 'http://localhost:8081'),
      isProd: JSON.stringify(isProd),
      isRelease: JSON.stringify(isRelease)
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new VueLoaderPlugin(),

    new StyleLintPlugin({
      files: ['src/**/*.{vue,css,scss}']
    }),

    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            { source: './src/images/search/*.png', destination: './dist/img' },
          ]
        },
      },
    }),
  );

  const adminPageArr = fs.readdirSync('./src/pages/admin', {withFileTypes: true}).filter(item => item.isDirectory()).map(item => item.name);
  const pageAll = [].concat(pageArr, adminPageArr);
  config.optimization = {
    minimizer: [
      new UglifyPlugin({
        uglifyOptions: {
          compress: {
            drop_debugger: true,
            dead_code: true,
            unused: true
          },
          warnings: false
        },
        minify: (file, sourceMap) => {
          const uglifyJsOptions = {
            compress: {
              drop_debugger: true,
              dead_code: true,
              unused: true
            },
            warnings: false
          };

          if (sourceMap) {
            uglifyJsOptions.sourceMap = {
              content: sourceMap,
            };
          }

          return require('uglify-js').minify(file, uglifyJsOptions)
        },
        extractComments: false,
        sourceMap: true,
      }),
      new OptimizeCssAssetsPlugin()
    ],
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks(chunk) {
            return pageAll.indexOf(chunk.name) > -1
          },
          minChunks: pageAll.length
        },
        lib: {
          name: 'lib',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](vue|vue-class-component|vue-property-decorator|vuex|vuex-class)[\\/]/
        },
        polyfill: {
          name: 'polyfill',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](@babel|core-js|whatwg-fetch)[\\/]/
        }
      }
    }
  };

  config.devServer = {
    contentBase: path.join(__dirname, './dist'),
    historyApiFallback: {
      rewrites:  [
        {from: /^\/login$/, to: '/login.html'},
        {from: /^\/admin$/, to: '/admin.html'},
        {from: /^\/search$/, to: '/search.html'},
        {from: /^.*$/, to: '/index.html'}
        ]
    },
    stats: {
      modules: false,
      cached: false,
      colors: true,
      chunk: false,
    },
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 80,
    proxy: {
    }
  };

  return config;
};
