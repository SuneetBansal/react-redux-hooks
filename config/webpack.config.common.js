const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')

const paths = require('./paths')

const isDev = process.env.NODE_ENV === 'development'
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = paths.servedPath === './'
// Options for autoPrefixer
const autoprefixerOptions = {
  browsers: [
    '>1%',
    'last 4 versions',
    'Firefox ESR',
    'not ie < 9', // React doesn't support IE8 anyway
  ],
  flexbox: 'no-2009',
}
// Note: defined here because it will be used more than once.
const cssFilename = 'static/css/[name].[contenthash:8].css'
const cssClassName = isDev ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:5]'
// Heads up!
// We use ExtractTextPlugin to extract LESS content in production environment,
// we will still use fallback to style-loader in development.
const extractLess = new ExtractTextPlugin({
  filename: cssFilename,
  disable: isDev
})
// ExtractTextPlugin expects the build output to be flat.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
  { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {}
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.NODE_ENV === 'production' && process.env.GENERATE_SOURCEMAP !== 'false'

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  module: {
    strictExportPresence: true,
    // { parser: { requireEnsure: false } },
    rules: [
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          compact: process.env.NODE_ENV === 'production',
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: isDev,
        },
      },
      // "postcss" loader applies autoprefixer to our LESS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.less$/,
        exclude: [
          path.resolve(paths.appSrc, 'components'),
        ],
        use: extractLess.extract({
          fallback: {
            loader: 'style-loader',
            options: {
              hmr: isDev,
            },
          },
          use: [
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                minimize: process.env.NODE_ENV === 'production',
                sourceMap: shouldUseSourceMap,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                // Necessary for external CSS imports to work
                ident: 'postcss',
                plugins: () => [
                  require('postcss-flexbugs-fixes'),
                  autoprefixer(autoprefixerOptions),
                ],
              },
            },
            { loader: require.resolve('less-loader') }
          ],
          ...extractTextPluginOptions,
        }),
      },
      // Heads up!
      // We apply CSS modules only to our components, this allow to use them
      // and don't break SUI.
      {
        test: /\.less$/,
        include: [
          path.resolve(paths.appSrc, 'components'),
        ],
        use: extractLess.extract({
          fallback: {
            loader: require.resolve('style-loader'),
            options: {
              hmr: isDev,
            },
          },
          use: [
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                localIdentName: cssClassName,
                modules: true,
                minimize: process.env.NODE_ENV === 'production',
                sourceMap: shouldUseSourceMap,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                // Necessary for external CSS imports to work
                ident: 'postcss',
                plugins: () => [
                  require('postcss-flexbugs-fixes'),
                  autoprefixer(autoprefixerOptions),
                ],
              },
            },
            { loader: require.resolve('less-loader') }
          ],
        }),
      },
      // I also want to be able to load CSS. So let's do that.
      {
          test: /\.css$/,
          use: [
              {
                  loader: 'style-loader',
                  options: {
                      hmr: isDev,
                  },
              },
              {
                  loader: require.resolve('css-loader'),
                  options: {
                      importLoaders: 1,
                      minimize: process.env.NODE_ENV === 'production',
                      sourceMap: shouldUseSourceMap,
                  },
              },
              {
                  loader: require.resolve('postcss-loader'),
                  options: {
                      // Necessary for external CSS imports to work
                      ident: 'postcss',
                      plugins: () => [
                          require('postcss-flexbugs-fixes'),
                          autoprefixer(autoprefixerOptions),
                      ],
                  },
              },
          ],
      },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      // "file" loader makes sure assets end up in the `build` folder.
      // When you `import` an asset, you get its filename.
      {
        test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  plugins: [
    extractLess,
  ],
  resolve: {
    alias: {
      '../../theme.config$': path.resolve(paths.appSrc, 'styling/theme.config'),
      heading: path.resolve(paths.appSrc, 'styling/heading.less'),
    },
    modules: [
      'node_modules',
      paths.appNodeModules,
      paths.appSrc,
    ].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.js', '.json', '.jsx'],
    plugins: [
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  }
}
