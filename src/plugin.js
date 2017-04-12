'use strict';

const bless = require('bless');
const webpackSources = require('webpack-sources');

const RawSource = webpackSources.RawSource;
const SourceMapSource = webpackSources.SourceMapSource;
const CSS_REGEXP = /\.css$/;

function createBlessedFileName(filenameWithoutExtension, index, numFiles) {
  return index === numFiles - 1 ? `${filenameWithoutExtension}.css` : `${filenameWithoutExtension}-blessed${index}.css`;
}

/**
 * Inject @import rules into a .css file for all others
 */
function addImports(parsedData, filenameWithoutExtension) {
  let numFiles = parsedData.data.length;
  const sourceToInjectIndex = numFiles - 1;
  let addImports = '';

  parsedData.data.map((fileContents, index) => { // eslint-disable-line max-nested-callbacks
    if (index !== sourceToInjectIndex) {
      const filename = createBlessedFileName(filenameWithoutExtension, index, numFiles);
      // E.g. @import url(app-blessed1.css);
      addImports += `@import url(${filename});\n`;
    }
    return fileContents;
  });

  parsedData.data[sourceToInjectIndex] = `${addImports}\n${parsedData.data[sourceToInjectIndex]}`;

  return parsedData;
}

class BlessCSSWebpackPlugin {

  constructor(options) {
    options = options || {
      sourceMap: false,
      addImports: false
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

              let parsedData = bless.chunk(input.source, {
                sourcemaps: this.options.sourceMap,
                source: this.options.sourceMap ? input.map.sources[0] : null
              });

              if (parsedData.data.length > 1) {
                if (this.options.addImports) {
                  // Inject imports into primary created file
                  parsedData = addImports(parsedData, filenameWithoutExtension);
                }

                let numFiles = parsedData.data.length;
                parsedData.data.forEach((fileContents, index) => { // eslint-disable-line max-nested-callbacks
                  const filename = createBlessedFileName(filenameWithoutExtension, index, numFiles);
                  const outputSourceMap = parsedData.maps[index];

                  if (outputSourceMap) {
                    compilation.assets[filename] = new SourceMapSource(fileContents, filename, outputSourceMap, input.source, input.map);
                  } else {
                    compilation.assets[filename] = new RawSource(fileContents);
                  }

                  if (index < numFiles - 1 && !this.options.addImports) {
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
