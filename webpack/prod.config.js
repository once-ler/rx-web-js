const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  devtool: 'cheap-module-source-map',
  // devtool: 'sourcemap',
  entry: ['./index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'mongo-dump-next.js'
  },

  progress: true,
  
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.js', '.jsx', '.json']
  },

  plugins: [
    new webpack.DefinePlugin({
        'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.IgnorePlugin(/\.(css|less)$/),
    /*
    new webpack.BannerPlugin('require("source-map-support").install();', { 
      raw: true, entryOnly: false 
    })
    */
  ],

  target: 'node',
  externals: nodeModules,
  
  // webpack issue #1599
  node: {
    __dirname: false,
    __dirname: false
  },
  
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel'], exclude: /node_modules/ },
      {test: /\.json$/, loaders: ['json'] }
    ]
  }
};
