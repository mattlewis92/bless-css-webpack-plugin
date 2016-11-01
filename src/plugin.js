const bless = require('bless');

const CSS_REGEXP = /\.css$/;

class BlessCSSWebpackPlugin {

  apply(compiler) {

    compiler.plugin('emit', (compilation, callback) => {

      Object.keys(compilation.assets)
        .filter(filename => filename.match(CSS_REGEXP))
        .map(cssFileName => {
          const parsedData = bless.chunk(compilation.assets[cssFileName].source(), {source: cssFileName});
          if (parsedData.data.length > 1) {
            const filenameWithoutExtension = cssFileName.replace(CSS_REGEXP, '');

            parsedData.data.forEach((file, index) => {

              const filename = index === 0 ? cssFileName : `${filenameWithoutExtension}-blessed${index}.css`;

              compilation.assets[filename] = {
                source() {
                  return file;
                },
                size() {
                  return file.length;
                }
              };

            });

          }
        });

      callback();

    });

  }

}

module.exports = BlessCSSWebpackPlugin;