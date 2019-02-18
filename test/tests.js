const assert = require('assert');
const { rollup } = require('rollup');
const rimraf = require('rimraf');
const htmlTemplate = require('../dist/rollup-plugin-generate-html-template');
const { stat, readFile } = require('fs');

const outputFile = 'output/bundle.js';

// Change working directory to current
process.chdir(__dirname);

describe('rollup-plugin-generate-html-template', () => {
  afterEach(() => promisify(rimraf, 'output/'));

  it('should copy the template to output dir with an injected bundle', (done) => {
    const targetOutput = 'output/template.html';
    
    build({
      template: 'fixtures/template.html',
    })
        .then(() =>
          Promise.all([
            assertExists(targetOutput),
            assertOutput(targetOutput, getHtmlString()),
          ])
        )
        .then(() => done())
        .catch(() => done());
  });

  describe('options.target', () => {
    it('should copy the template to output dir with the provided name', (done) => {
      const targetOutput = 'output/index.html';

      build({
        template: 'fixtures/template.html',
        target: 'index.html',
      })
          .then(() =>
            Promise.all([
              assertExists(targetOutput),
              assertOutput(targetOutput, getHtmlString()),
            ])
          )
          .then(() => done())
          .catch(() => done());
    });
  });
});

// Turn a normal callback async function into a promise.
const promisify = (fn, ...args) => {
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
};

// Run the rollup build with an plugin configuration.

const build = (config) => {
  return new Promise((resolve, reject) => {
    const inputOptions = {
      input: './fixtures/index.js',
      plugins: [htmlTemplate(config)],
    };
    const outputOptions = {
      file: outputFile,
      format: 'iife',
      name: 'test',
    };

    // 1. create a bundle
    // 2. generate code
    // 3. write the bundle to disk
    rollup(inputOptions)
        .then((bundle) => bundle.generate(outputOptions).then(() => bundle))
        .then((bundle) => bundle.write(outputOptions))
        .then(resolve)
        .catch(reject);
  });
};

const getHtmlString = (bundle = 'bundle.js') => {
  return `
  <html>
    <body>
      <h1>Hello World.</h1>
      <script src="${bundle}"></script>
    </body>
  </html>
  `;
};

// Asserts that the output of a file matches the content provided.
const assertOutput = (file, content) => {
  return promisify(readFile, file, 'utf8').then((output) =>
    assert.equal(output.replace(/[\W]/gi, ''), content.replace(/[\W]/gi, ''))
  );
};

// Asserts that a file does or does not exist.
const assertExists = (file, shouldExist = true) => {
  return promisify(stat, file)
      .then(() => true, () => false)
      .then((exists) => assert.ok(exists === shouldExist));
};
