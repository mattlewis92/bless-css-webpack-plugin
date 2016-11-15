'use strict';

const os = require('os');
const fs = require('fs');
const webpack = require('webpack');
const expect = require('chai').expect;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
  ]).then((main) => {
    const main1 = main[0];
    const main2 = main[1];
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
  ]).then((main) => {
    const main1 = main[0];
    const main2 = main[1];
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

it('should support the html webpack plugin', done => {

  readFile(__dirname + '/fixtures/expected/index.html').then(index => {
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
        new HtmlWebpackPlugin(),
        new BlessCSSWebpackPlugin(),
        extractCSS
      ]
    };

    webpack(webpackConfig, (err, stats) => {

      if (err) {
        done(err);
      } else {
        expect(stats.compilation.assets['index.html'].source()).to.equal(index);
        done();
      }

    });
  }).catch(done);

});

it('should support sourcemaps', done => {

  const extractCSS = new ExtractTextPlugin('[name].css');

  const webpackConfig = {
    entry: __dirname + '/fixtures/scss/entry.js',
    devtool: 'sourcemap',
    output: {
      path: os.tmpdir() + '/output',
    },
    module: {
      loaders: [{
        test: /\.scss$/,
        loader: extractCSS.extract(['css-loader?sourceMap', 'sass-loader?sourceMap'])
      }]
    },
    plugins: [
      new BlessCSSWebpackPlugin({
        sourceMap: true
      }),
      extractCSS
    ]
  };

  webpack(webpackConfig, (err, stats) => {

    if (err) {
      done(err);
    } else {
      expect(stats.compilation.assets['main.css.map']).to.be.ok;
      expect(stats.compilation.assets['main-blessed1.css.map']).to.be.ok;
      done();
    }

  });

});
