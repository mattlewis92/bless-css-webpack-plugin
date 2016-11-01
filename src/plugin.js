const bless = require('bless');

const CSS_REGEXP = /\.css$/;

class BlessCSSWebpackPlugin {

  apply(compiler) {

    compiler.plugin('this-compilation', (compilation) => {

      compilation.plugin('optimize-assets', (assets, callback) => {

        compilation.chunks.forEach(chunk => {
          chunk.files
            .filter(filename => filename.match(CSS_REGEXP))
            .forEach(cssFileName => {

              const parsedData = bless.chunk(assets[cssFileName].source(), {source: cssFileName});
              if (parsedData.data.length > 1) {
                const filenameWithoutExtension = cssFileName.replace(CSS_REGEXP, '');

                parsedData.data.forEach((file, index) => {

                  const filename = index === 0 ? cssFileName : `${filenameWithoutExtension}-blessed${index}.css`;

                  assets[filename] = {
                    source() {
                      return file;
                    },
                    size() {
                      return file.length;
                    }
                  };

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