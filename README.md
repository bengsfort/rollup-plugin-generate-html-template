# rollup-plugin-generate-html-template

![build status](https://api.travis-ci.org/bengsfort/rollup-plugin-generate-html-template.svg?branch=master) ![npm version](https://badge.fury.io/js/rollup-plugin-generate-html-template.svg)

Auto-inject the resulting rollup bundle via a `script` tag into a HTML template.

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

On final bundle generation the provided template file will have a `script` tag injected directly above the closing `body` tag with a link to the js bundle. By default it uses the same file name and places it directly next to the JS bundle.

```html
<!-- src/index.html -->
<html>
<body>
    <canvas id="main"></canvas>
</body>
</html>

<!-- dist/index.html -->
<html>
<body>
    <canvas id="main"></canvas>
    <script src="bundle.js"></script>
</body>
</html>
```

### Options

- `template`: **(required)** The path to the source template.
- `target`: The file name to use for the html file generated with the bundle.

## License

MIT