const path = require('path');
const webpack = require('webpack');

module.exports = {
  outputDir: path.resolve(__dirname, './www'),
  css: {
    loaderOptions: {
      postcss: {
        postcssOptions: {
          plugins: [
            require('autoprefixer'),
          ],
        },
      },
    },
  },
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        vm: require.resolve('vm-browserify'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    ],
    performance: {
      hints: false, // Disable size warnings
    },
  },
};
