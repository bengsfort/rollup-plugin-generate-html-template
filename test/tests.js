import assert from 'assert';
import { rollup } from 'rollup';
import rimraf from 'rimraf';
import htmlTemplate from '../dist/rollup-plugin-generate-html-template.module';
import { stat, readFile } from 'fs';

const output = 'output/bundle.js';

// Change working directory to current
process.chdir(__dirname);

describe('rollup-plugin-generate-html-template', function() {
  after(() => promisify(rimraf, 'output/'));

  it('should copy the template to output dir with an injected bundle', function(done) {
    const targetOutput = 'output/template.html';
    build({ template: 'fixtures/template.html' })
      .then(() => Promise.all([
        assertExists(targetOutput),
        assertOutput(targetOutput, getHtmlString()),
      ]))
      .then(() => done());
  });

  it('should copy the template to output dir with the provided name', function(done) {
    const targetOutput = 'output/index.html';
    build({
      template: 'fixtures/template.html',
      target: 'index.html',
    }).then(() => Promise.all([
      assertExists(targetOutput),
      assertOutput(targetOutput, getHtmlString())
    ]))
    .then(() => done());
  });
});

// Turn a normal callback async function into a promise.
function promisify(fn, ...args) {
  return new Promise((resolve, reject) => {
    try {
      fn(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// Run the rollup build with an plugin configuration.
function build(config) {
  return rollup({
    input: './fixtures/index.js',
    plugins: [
      htmlTemplate(config),
    ],
  }).then(bundle => bundle.write({
    file: output,
    format: 'iife',
    name: 'test',
  }));
}

function getHtmlString(bundle = 'bundle.js') {
  return `
  <html>
    <body>
      <h1>Moi minun jäbät</h1>
      <script src="${bundle}"></script>
    </body>
  </html>
  `;
}

// Asserts that the output of a file matches the content provided.
function assertOutput(file, content) {
  return promisify(readFile, file, 'utf8')
    .then(output => assert.equal(
      output.replace(/[\W]/gi, ''),
      content.replace(/[\W]/gi, ''))
    );
}

// Asserts that a file does or does not exist.
function assertExists(file, shouldExist = true) {
  return promisify(stat, file)
    .then(() => true, () => false)
    .then((exists) => assert.ok(exists === shouldExist));
}