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

              const parsedData = bless.chunk(input.source, {
                sourcemaps: this.options.sourceMap,
                source: this.options.sourceMap ? input.map.sources[0] : null
              });

              if (this.options.importRules) {
                // Reverse data to have sequential @import rules
                parsedData.data.reverse();

                // Chunk the data for use in creating import lines
                const parsedDataSimple = bless.chunk(input.source);

                // Inject imports into primary created file
                parsedData.data[0] = this.injectImportRules(parsedData.data[0], parsedDataSimple, filenameWithoutExtension);
              }

              if (parsedData.data.length > 1) {
                parsedData.data.forEach((fileContents, index) => { // eslint-disable-line max-nested-callbacks
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

  /**
   * Inject @import rules into a .css file for all others
   */
  injectImportRules(source, parsedData, filenameWithoutExtension) {
    let importRules = '';
    parsedData.data.map((fileContents, index) => { // eslint-disable-line max-nested-callbacks
      if (index > 0) {
        const filename = `${filenameWithoutExtension}-blessed${parsedData.data.length - index}.css`;
        // E.g. @import url(app-blessed1.css);
        importRules += '@import url(' + filename + ');\n';
      }
      return fileContents;
    });

    // Inject into input.source
    return importRules + source;
  }

}

module.exports = BlessCSSWebpackPlugin;
