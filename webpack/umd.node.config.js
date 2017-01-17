var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var BASE_DIR = process.cwd();
var COMPONENT_FILE = 'rx-web.node';
var COMPONENT_NAME = 'RxWeb';
var plugins = [];

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

function getPackageMain() {
  return require(path.resolve(BASE_DIR, 'package.json')).main;
}

plugins.push(
  new webpack.optimize.UglifyJsPlugin()
);

COMPONENT_FILE += '.min';
plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
);

var config = {
  devtool: 'cheap-module-source-map',
  entry: [path.resolve(BASE_DIR, 'src/server.js')],
  output: {
    path: path.join(__dirname, '/../dist'),
    publicPath: 'dist/',
    filename: COMPONENT_FILE + '.js',
    sourceMapFilename: COMPONENT_FILE + '.map',
    library: COMPONENT_NAME,
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      { test: /\.(js|jsx)/, exclude: /node_modules/, loader: 'babel'},
      { test: /\.css$/, loader: 'style-loader!css-loader'},
      { test: /\.json$/, loaders: ['json'] }
    ],
  },
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.jsx', '.css'],
  },
  externals: nodeModules  
};

config.target = 'node';
config.resolve.modulesDirectories = [ 'node_modules' ];
config.node = {
  __dirname: false
};

module.exports = config;
