'use strict';

import fs from 'fs';
import path from 'path';

/**
 * Takes an HTML file as a template then adds the bundle to the final file.
 * @param {Object} options The options object.
 * @return {Object} The rollup code object.
 */
export default function htmlTemplate(options = {}) {
  const { template } = options;

  return {
    name: 'html-template',
    onwrite: function write(writeOptions) {
      const bundle = writeOptions.file;
      return new Promise((resolve, reject) =>
        fs.readFile(template, (err, buffer) => {
          if (err) {
            return reject(err);
          }

          // Convert buffer to a string and get the </body> index.
          const tmpl = buffer.toString('utf8');
          const bodyCloseTag = tmpl.lastIndexOf('</body>');

          // Inject the script tag before the body close tag.
          const injected = [
            tmpl.slice(0, bodyCloseTag),
            `<script src="${path.basename(bundle)}"></script>\n`,
            tmpl.slice(bodyCloseTag, tmpl.length),
          ].join('');

          // Write the injected template to a file.
          promisify(
            fs.writeFile,
            path.join(path.dirname(bundle), path.basename(template)),
            injected
          ).then(() => resolve(), (e) => reject(e));
        })
      );
    },
  };
}

/**
 * Promisify's a function.
 * @param {Function} fn The function to turn into a promise.
 * @param {any[]} args The arguments for the function.
 * @return {Promise} A Promise for the function.
 */
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
