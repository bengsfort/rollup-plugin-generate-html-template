import { rollup } from "rollup";
import fs from "fs-extra";
import os from "os";
import path from "path";

import htmlTemplate from "../dist/rollup-plugin-generate-html-template";

let TEST_DIR;

function getHtmlString(bundle = "bundle.js") {
  return `
  <html>
    <body>
      <h1>Hello World.</h1>
      ${
        typeof bundle !== "string" && bundle.length
          ? bundle.map(b => `<script src="${b}"></script>`)
          : `<script src="${bundle}"></script>`
      }
    </body>
  </html>
  `.replace(/[\W]/gi, "");
}

beforeEach(async () => {
  TEST_DIR = path.join(os.tmpdir(), "rollup-plugin-generate-html-template");
  await fs.emptyDir(TEST_DIR);
});

afterAll(async () => {
  await fs.emptyDir(TEST_DIR);
});

it("should copy the template to the output dir with an injected single bundle", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");
  // Defaults to not renaming the template.
  const TEMPLATE_PATH = path.join(TEST_DIR, "template.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
      }),
    ],
  };
  const output = {
    file: BUNDLE_PATH,
    format: "iife",
    name: "test",
  };
  const bundle = await rollup(input);
  await bundle.write(output);

  // Ensure files exist
  await expect(fs.pathExists(BUNDLE_PATH)).resolves.toEqual(true);
  await expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);

  // Ensure output has bundle injected
  const generatedTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
  expect(generatedTemplate.replace(/[\W]/gi, "")).toEqual(
    getHtmlString("bundle.js")
  );
});

it("should rename templates if provided a target option.", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");
  const TEMPLATE_PATH = path.join(TEST_DIR, "index.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        target: "index.html",
      }),
    ],
  };
  const output = {
    file: BUNDLE_PATH,
    format: "iife",
    name: "test",
  };
  const bundle = await rollup(input);
  await bundle.write(output);

  // Ensure files exist
  await expect(fs.pathExists(BUNDLE_PATH)).resolves.toEqual(true);
  await expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);
});

it("should work with chunking", async () => {
  const BUNDLE_CHUNK_1 = path.join(TEST_DIR, "entry-index.js");
  const BUNDLE_CHUNK_2 = path.join(TEST_DIR, "entry-bar.js");
  const TEMPLATE_PATH = path.join(TEST_DIR, "index.html");

  const input = {
    input: {
      index: `${__dirname}/fixtures/index.js`,
      bar: `${__dirname}/fixtures/bar.js`,
    },
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        target: "index.html",
      }),
    ],
  };
  const output = {
    dir: TEST_DIR,
    format: "esm",
    entryFileNames: "entry-[name].js",
  };
  const bundle = await rollup(input);
  bundle.write(output);

  console.log("test dirs:", TEST_DIR);
  const files = await fs.readdir(TEST_DIR);
  console.log("Files:", files);

  // Ensure files exist
  await expect(fs.pathExists(BUNDLE_CHUNK_1)).resolves.toEqual(true);
  await expect(fs.pathExists(BUNDLE_CHUNK_2)).resolves.toEqual(true);
  await expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);

  // Ensure output has bundle injected
  const generatedTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
  expect(generatedTemplate.replace(/[\W]/gi, "")).toEqual(
    getHtmlString(["index.js", "chunked.js"])
  );
});
