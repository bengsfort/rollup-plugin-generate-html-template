"use strict";

import fs from "fs-extra";
import path from "path";

/**
 * Takes an HTML file as a template then adds the bundle to the final file.
 * @param {Object} options The options object.
 * @return {Object} The rollup code object.
 */
export default function htmlTemplate(options = {}) {
  const { template, target } = options;

  // Get the target file name.
  const targetName = path.basename(target || template);

  // Add the file suffix if it isn't there.
  const targetFile =
    targetName.indexOf(".html") < 0 ? `${targetName}.html` : targetName;

  return {
    name: "html-template",

    async generateBundle(outputOptions, bundleInfo) {
      const targetDir = outputOptions.dir || path.dirname(outputOptions.file);
      const bundles = getEntryPoints(bundleInfo);
      //eslint-disable-next-line
      return new Promise(async (resolve, reject) => {
        try {
          const buffer = await fs.readFile(template);

          // Convert buffer to a string and get the </body> index
          const tmpl = buffer.toString("utf8");
          const bodyCloseTag = tmpl.lastIndexOf("</body>");

          // Inject the script tags before the body close tag
          const injected = [
            tmpl.slice(0, bodyCloseTag),
            bundles.map(b => `<script src="${b}"></script>\n`),
            tmpl.slice(bodyCloseTag, tmpl.length),
          ].join("");

          // write the injected template to a file
          const finalTarget = path.join(targetDir, targetFile);
          await fs.ensureFile(finalTarget);
          await fs.writeFile(finalTarget, injected);
          resolve();
        } catch (e) {
          console.error(e); //eslint-disable-line
          throw new Error(e);
          // reject(e);
        }
      });
    },
  };
}

function getEntryPoints(bundleInfo = {}) {
  const bundles = Object.keys(bundleInfo);
  return bundles.reduce((entryPoints, bundle) => {
    if (bundleInfo[bundle].isEntry === true) {
      entryPoints.push(bundle);
    }
    return entryPoints;
  }, []);
}

// Expose getEntryPoints for testing
htmlTemplate.getEntryPoints = getEntryPoints;
