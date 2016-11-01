# bless-css-webpack-plugin
A webpack plugin for bless CSS

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

## Differences from bless-webpack-plugin
* Works with the html webpack plugin
* Has tests
* Uses bless 4.0
* Works with sourcemaps

## License
MIT