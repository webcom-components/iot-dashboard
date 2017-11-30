var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    main: './app/index.js',
    vendor: './app/vendor.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            use: 'css-loader'
        })
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: {loader: 'url-loader',options:{limit:10000,mimetype:'application/octet-stream'}}},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: {loader: 'file-loader'}},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: {loader: 'url-loader',options:{limit:10000,mimetype:'image/svg+xml'}}}
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
    "$": "jquery",
    "jquery": "jquery",
    "jQuery": "jquery",
    "window.jQuery": "jquery"
}),
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
           // this assumes your vendor imports exist in the node_modules directory
           return module.context && module.context.indexOf('node_modules') !== -1;
        }
    }),
    //CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest' //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    })
  ],
  devtool: "inline-source-map"  ,
  devServer: {
    contentBase: path.join(__dirname, "app")
  },
  resolve: {
        alias: {
                webcom: 'webcom/webcom.js'
        }
  }


};
