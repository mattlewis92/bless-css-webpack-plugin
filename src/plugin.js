'use strict';

const bless = require('bless');
const {RawSource, SourceMapSource} = require('webpack-sources');

const CSS_REGEXP = /\.css$/;

class BlessCSSWebpackPlugin {

  constructor(options = {sourceMap: false}) {
    this.options = options;
  }

  apply(compiler) {

    compiler.plugin('compilation', (compilation) => {

      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {

        chunks.forEach(chunk => {

          chunk.files
            .filter(filename => filename.match(CSS_REGEXP))
            .forEach(cssFileName => {

              const asset = compilation.assets[cssFileName];
              let input = {};

              if (this.options.sourceMap) {

                if (asset.sourceAndMap) {
                  input = asset.sourceAndMap();
                } else {
                  input.map = asset.map();
                  input.source = asset.source();
                }

              } else {
                input.source = asset.source();
              }

              const parsedData = bless.chunk(input.source, {
                sourcemaps: this.options.sourceMap,
                source: this.options.sourceMap ? input.map.sources[0] : null
              });

              if (parsedData.data.length > 1) {

                const filenameWithoutExtension = cssFileName.replace(CSS_REGEXP, '');

                parsedData.data.forEach((fileContents, index) => {

                  const filename = index === 0 ? cssFileName : `${filenameWithoutExtension}-blessed${index}.css`;
                  const outputSourceMap = parsedData.maps[index];

                  if (outputSourceMap) {
                    compilation.assets[filename] = new SourceMapSource(fileContents, filename, outputSourceMap, input.source, input.map);
                  } else {
                    compilation.assets[filename] = new RawSource(fileContents);
                  }

                  if (index > 0) {
                    chunk.files.push(filename);
                  }

                });

              }

            });
        });

        callback();

      });

    });

  }

}

module.exports = BlessCSSWebpackPlugin;
