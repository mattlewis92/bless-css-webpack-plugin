'use strict';

const path = require('path');
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
    readFile(path.join(__dirname, 'fixtures/expected/main.css')),
    readFile(path.join(__dirname, 'fixtures/expected/main-blessed1.css'))
  ]).then(main => {
    const main1 = main[0];
    const main2 = main[1];

    const webpackConfig = {
      entry: path.join(__dirname, 'fixtures/css/entry.js'),
      output: {
        path: os.tmpdir() + '/output'
      },
      module: {
        rules: [{
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        }]
      },
      plugins: [
        new BlessCSSWebpackPlugin(),
        new ExtractTextPlugin('[name].css')
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
    readFile(path.join(__dirname, 'fixtures/expected/main.css')),
    readFile(path.join(__dirname, 'fixtures/expected/main-blessed1.css'))
  ]).then(main => {
    const main1 = main[0];
    const main2 = main[1];

    const webpackConfig = {
      entry: path.join(__dirname, 'fixtures/scss/entry.js'),
      output: {
        path: os.tmpdir() + '/output'
      },
      module: {
        rules: [{
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
        }]
      },
      plugins: [
        new BlessCSSWebpackPlugin(),
        new ExtractTextPlugin('[name].css')
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
  readFile(path.join(__dirname, 'fixtures/expected/index.html')).then(index => {
    const webpackConfig = {
      entry: path.join(__dirname, 'fixtures/css/entry.js'),
      output: {
        path: os.tmpdir() + '/output'
      },
      module: {
        rules: [{
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        }]
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new BlessCSSWebpackPlugin(),
        new ExtractTextPlugin('[name].css')
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
  const webpackConfig = {
    entry: path.join(__dirname, 'fixtures/scss/entry.js'),
    devtool: 'sourcemap',
    output: {
      path: os.tmpdir() + '/output'
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader?sourceMap', 'sass-loader?sourceMap']
        })
      }]
    },
    plugins: [
      new BlessCSSWebpackPlugin({
        sourceMap: true
      }),
      new ExtractTextPlugin('[name].css')
    ]
  };

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      done(err);
    } else {
      expect(Boolean(stats.compilation.assets['main.css.map'])).to.equal(true);
      expect(Boolean(stats.compilation.assets['main-blessed1.css.map'])).to.equal(true);
      done();
    }
  });
});
