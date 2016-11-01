const os = require('os');
const fs = require('fs');
const webpack = require('webpack');
const {expect} = require('chai');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BlessCSSWebpackPlugin = require('./../src/plugin');

const readFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, contents) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents.toString());
      }
    });
  });
};

it('should chunk up CSS into multiple files', done => {

  Promise.all([
    readFile(__dirname + '/fixtures/expected/main.css'),
    readFile(__dirname + '/fixtures/expected/main-blessed1.css')
  ]).then(([main1, main2]) => {
    const extractCSS = new ExtractTextPlugin('[name].css');

    const webpackConfig = {
      entry: __dirname + '/fixtures/css/entry.js',
      output: {
        path: os.tmpdir() + '/output',
      },
      module: {
        loaders: [{
          test: /\.css$/,
          loader: extractCSS.extract(['css-loader'])
        }]
      },
      plugins: [
        new BlessCSSWebpackPlugin(),
        extractCSS
      ]
    };

    webpack(webpackConfig, (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.toJson().assets[1].name).to.equal('main.css');
        expect(stats.toJson().assets[2].name).to.equal('main-blessed1.css');
        expect(stats.compilation.assets['main.css'].source()).to.equal(main1);
        expect(stats.compilation.assets['main-blessed1.css'].source()).to.equal(main2);
        done();
      }

    });
  }).catch(done);

});

it('should compile SASS, then chunk it into multiple files', done => {

  Promise.all([
    readFile(__dirname + '/fixtures/expected/main.css'),
    readFile(__dirname + '/fixtures/expected/main-blessed1.css')
  ]).then(([main1, main2]) => {
    const extractCSS = new ExtractTextPlugin('[name].css');

    const webpackConfig = {
      entry: __dirname + '/fixtures/scss/entry.js',
      output: {
        path: os.tmpdir() + '/output',
      },
      module: {
        loaders: [{
          test: /\.scss$/,
          loader: extractCSS.extract(['css-loader', 'sass-loader'])
        }]
      },
      plugins: [
        new BlessCSSWebpackPlugin(),
        extractCSS
      ]
    };

    webpack(webpackConfig, (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.toJson().assets[1].name).to.equal('main.css');
        expect(stats.toJson().assets[2].name).to.equal('main-blessed1.css');
        expect(stats.compilation.assets['main.css'].source()).to.equal(main1);
        expect(stats.compilation.assets['main-blessed1.css'].source()).to.equal(main2);
        done();
      }

    });
  }).catch(done);

});