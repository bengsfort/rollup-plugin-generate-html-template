# rollup-plugin-generate-html-template

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
  dest: 'dist/bundle.js',
  plugins: [
    htmlTemplate({ file: 'src/index.html' }),
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

## License

MIT