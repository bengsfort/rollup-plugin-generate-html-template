# rollup-plugin-generate-html-template

![build status](https://api.travis-ci.org/bengsfort/rollup-plugin-generate-html-template.svg?branch=master) [![npm version](https://badge.fury.io/js/rollup-plugin-generate-html-template.svg)](https://www.npmjs.com/package/rollup-plugin-generate-html-template) ![code coverage](coverage/coverage.svg)

Auto-inject the resulting rollup bundle via `script` and `link` tags into an HTML template.

## Installation

```shell
npm install --save-dev rollup-plugin-generate-html-template
```

## Usage

```js
// rollup.config.js
import htmlTemplate from 'rollup-plugin-generate-html-template';

export default {
  entry: 'src/index.js',
  dest: 'dist/js/bundle.js',
  plugins: [
    htmlTemplate({
      template: 'src/template.html',
      target: 'index.html',
    }),
  ],
};
```

On final bundle generation the provided template file will have a `script` tag injected directly above the closing `body` tag with a link to the js bundle and similarly a `link` tag above the closing `head` to the css bundle. By default it uses the same file name and places it directly next to the JS bundle.

```html
<!-- src/index.html -->
<html>
  <head>
    <title>Example</title>
  <head>
<body>
  <canvas id="main"></canvas>
</body>
</html>

<!-- dist/index.html -->
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" type="text/css" href="bundle.css">
  <head>
<body>
  <canvas id="main"></canvas>
  <script src="bundle.js"></script>
</body>
</html>
```

### Options

- `template`: **(required)** The path to the source template.
- `target`: The directory and file name to use for the html file generated with the bundle.
- `attrs`: The attributes provided to the generated bundle script tag. Passed as an array of strings
  Example: `attrs: ['async', 'defer]` will generate `<script async defer src="bundle.js"></script>`
- `replaceVars`: An object containing variables that will be replaced in the generated html.
    Example: `replaceVars: { '__CDN_URL__': process.env.NODE_ENV === 'production' ? 'https://mycdn.com' : '' }` will replace all instances of `__CDN_URL__` with `http://mycdn.com` if the environment is production

## License

MIT
