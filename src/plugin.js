'use strict';

const bless = require('bless');
const webpackSources = require('webpack-sources');

const RawSource = webpackSources.RawSource;
const SourceMapSource = webpackSources.SourceMapSource;
const CSS_REGEXP = /\.css$/;

class BlessCSSWebpackPlugin {

  constructor(options) {
    options = options || {
      sourceMap: false,
      importRules: false
    };
    this.options = options;
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
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

              const filenameWithoutExtension = cssFileName.replace(CSS_REGEXP, '');

              /**
               * Inject @import rules into the primary .css file for all others
               */
              if (this.options.importRules) {
                const parsedDataSimple = bless.chunk(input.source);
                let importRules = '';

                parsedDataSimple.data.map((fileContents, index) => { // eslint-disable-line max-nested-callbacks
                  if (index > 0) {
                    const filename = `${filenameWithoutExtension}-blessed${index}.css`;
                    // E.g. @import url(app-blessed1.css);
                    importRules += '@import url(' + filename + ');\n';
                  }
                  return fileContents;
                });

                // Inject into input.source
                input.source = importRules + input.source;
              }

              const parsedData = bless.chunk(input.source, {
                sourcemaps: this.options.sourceMap,
                source: this.options.sourceMap ? input.map.sources[0] : null
              });

              if (parsedData.data.length > 1) {
                parsedData.data.forEach((fileContents, index) => { // eslint-disable-line max-nested-callbacks
                  const filename = index === 0 ? cssFileName : `${filenameWithoutExtension}-blessed${index}.css`;
                  const outputSourceMap = parsedData.maps[index];

                  if (outputSourceMap) {
                    compilation.assets[filename] = new SourceMapSource(fileContents, filename, outputSourceMap, input.source, input.map);
                  } else {
                    compilation.assets[filename] = new RawSource(fileContents);
                  }

                  if (index > 0 && !this.options.importRules) {
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
