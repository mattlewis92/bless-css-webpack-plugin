# bless-css-webpack-plugin

> A webpack plugin for bless CSS

[![project unmaintained](https://img.shields.io/badge/project-unmaintained-red.svg)](https://img.shields.io/badge/project-unmaintained-red.svg)
[![npm version](https://badge.fury.io/js/bless-css-webpack-plugin.svg)](http://badge.fury.io/js/bless-css-webpack-plugin)
[![Build Status](https://travis-ci.org/mattlewis92/bless-css-webpack-plugin.svg)](https://travis-ci.org/mattlewis92/bless-css-webpack-plugin)
[![codecov](https://codecov.io/gh/mattlewis92/bless-css-webpack-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/bless-css-webpack-plugin)
[![Dependency Status](https://david-dm.org/mattlewis92/bless-css-webpack-plugin.svg)](https://david-dm.org/mattlewis92/bless-css-webpack-plugin)
[![devDependency Status](https://david-dm.org/mattlewis92/bless-css-webpack-plugin/dev-status.svg)](https://david-dm.org/mattlewis92/bless-css-webpack-plugin?type=dev)

## ** Notice **

I no longer use this project as we dropped support at work for IE9 and below. If you would like to take ownership of this project please reach out to me on [twitter](https://twitter.com/mattlewis92_) or via my [website](https://mattlewis.me/#contact). Thanks!

## Installation

Install the plugin with npm:

```
npm install --save-dev bless-css-webpack-plugin
```

## Usage
```javascript
const BlessCSSWebpackPlugin = require('bless-css-webpack-plugin');

// in your webpack config
{
  plugins: [
    new BlessCSSWebpackPlugin(options)
  ]
}
```
### options

* `sourceMap` - set to `true` to enable sourcemaps. Default `false`.
* `addImports` - set to `true` to inject @import rules for generated files. Default `false`.

## Differences from bless-webpack-plugin
* Works with the html webpack plugin
* Has tests
* Uses bless 4.0
* Works with sourcemaps

## Credits
* The webpack source code and readme for how to write a plugin
* The original `bless-webpack-plugin` plugin

## License
MIT
