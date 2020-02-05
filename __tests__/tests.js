import { rollup } from "rollup";
import fs from "fs-extra";
import os from "os";
import path from "path";

import htmlTemplate from "../src";

let TEST_DIR;

function getHtmlString(
  bundle = "bundle.js",
  prefix = "",
  attrs = [],
  replaceValues = []
) {
  return `
  <html>
    <body>
      <h1>Hello World.</h1>
        ${Boolean(replaceValues[0]) ? `<h2>${replaceValues[0]}</h2>` : ""}
        ${
          Boolean(replaceValues[0])
            ? `<a href="${replaceValues[0]}">${replaceValues[0]}</a>`
            : ""
        }
        ${Boolean(replaceValues[1]) ? `<p>${replaceValues[1]}</p>` : ""}
      ${
        typeof bundle !== "string" && bundle.length
          ? bundle
              .map(
                b => `<script ${attrs.join(" ")} src="${prefix}${b}"></script>`
              )
              .join("")
          : `<script ${attrs.join(" ")} src="${prefix}${bundle}"></script>`
      }
    </body>
  </html>
  `.replace(/[\s]/gi, "");
}

beforeEach(async () => {
  TEST_DIR = path.join(os.tmpdir(), "rollup-plugin-generate-html-template");
  await fs.emptyDir(TEST_DIR);
});

afterAll(async () => {
  await fs.emptyDir(TEST_DIR);
});

it("getEntryPoints should return the entry point bundles", () => {
  const emptyResult = htmlTemplate.getEntryPoints();
  expect(emptyResult).toHaveLength(0);

  const result = htmlTemplate.getEntryPoints({
    "styles.css": {
      fileName: "styles.css",
      isAsset: true,
      source: "",
    },
    "entry-main.js": {
      fileName: "entry-main.js",
      isDynamicEntry: false,
      isEntry: true,
    },
    "entry-bar.js": {
      fileName: "entry-bar.js",
      isDynamicEntry: false,
      isEntry: true,
    },
    "chunk-f1e52583.js": {
      fileName: "chunk-f1e52583.js",
      isDynamicEntry: true,
      isEntry: false,
    },
  });
  const expected = ["entry-main.js", "entry-bar.js"];

  expect(result).toHaveLength(2);
  expect(result).toEqual(expect.arrayContaining(expected));
});

it("should correctly add the attributes to the injected script tag", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");
  // Defaults to not renaming the template.
  const TEMPLATE_PATH = path.join(TEST_DIR, "template.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        attrs: ["async", "defer"],
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
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
    getHtmlString("bundle.js", "", ["async", "defer"])
  );
});

it("correctly replaces all HTML variables", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");
  // Defaults to not renaming the template.
  const TEMPLATE_PATH = path.join(TEST_DIR, "template_replace.html");
  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template_replace.html`,
        replaceVars: {
          __HOME_URL__: "cool.com",
          "__COMPLEX__!@$#{}/()_REPLACEMENT__": "complex replacement",
        },
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
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
    getHtmlString("bundle.js", "", [], ["cool.com", "complex replacement"])
  );
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
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
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

it("should save template into directory if provided target option is a directory.", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "public/build/bundle.js");
  const TEMPLATE_PATH = path.join(TEST_DIR, "public/index.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        target: TEMPLATE_PATH,
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
  expect(fs.pathExists(BUNDLE_PATH)).resolves.toEqual(true);
  expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);
  const resultHtml = await fs.readFile(TEMPLATE_PATH, "utf8");
  const [, srcString] = resultHtml.match(/<script.*src="(.*)">/);
  expect(srcString).toEqual("build/bundle.js");
});

it("should work with chunking", async () => {
  const BUNDLE_CHUNK_1 = path.join(TEST_DIR, "entry-index.js");
  const BUNDLE_CHUNK_2 = path.join(TEST_DIR, "entry-nested/bar.js");
  const TEMPLATE_PATH = path.join(TEST_DIR, "index.html");

  const input = {
    input: {
      index: `${__dirname}/fixtures/index.js`,
      "nested/bar": `${__dirname}/fixtures/nested/bar.js`,
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
  await bundle.write(output);

  // Ensure files exist
  await expect(fs.pathExists(BUNDLE_CHUNK_1)).resolves.toEqual(true);
  await expect(fs.pathExists(BUNDLE_CHUNK_2)).resolves.toEqual(true);
  await expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);

  // Ensure output has bundle injected
  const generatedTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
    getHtmlString(["entry-index.js", "entry-nested/bar.js"])
  );
});

it("should work with non-existent targets", async () => {
  //  TEST_DIR exists, but does not contain dist/
  const BUNDLE_DIR = path.join(TEST_DIR, "dist");
  const BUNDLE_PATH = path.join(BUNDLE_DIR, "index.js");
  const TEMPLATE_PATH = path.join(BUNDLE_DIR, "template.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        target: "template.html",
      }),
    ],
  };
  const output = {
    file: BUNDLE_PATH,
    format: "iife",
    name: "test",
  };

  // It should not exist yet
  await expect(fs.pathExists(BUNDLE_DIR)).resolves.toEqual(false);

  // Do a build...
  const bundle = await rollup(input);
  await bundle.write(output);

  // Ensure files exist
  await expect(fs.pathExists(BUNDLE_PATH)).resolves.toEqual(true);
  await expect(fs.pathExists(TEMPLATE_PATH)).resolves.toEqual(true);

  // Ensure output has bundle injected properly
  const generatedTemplate = await fs.readFile(TEMPLATE_PATH, "utf8");
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
    getHtmlString("index.js")
  );
});

it("should append a prefix to script path if specified", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");
  // Defaults to not renaming the template.
  const TEMPLATE_PATH = path.join(TEST_DIR, "template.html");

  const input = {
    input: `${__dirname}/fixtures/index.js`,
    plugins: [
      htmlTemplate({
        template: `${__dirname}/fixtures/template.html`,
        prefix: "/shared/",
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
  expect(generatedTemplate.replace(/[\s]/gi, "")).toEqual(
    getHtmlString("bundle.js", "/shared/")
  );
});

it("should throw an error if called without the correct props", async () => {
  const BUNDLE_PATH = path.join(TEST_DIR, "bundle.js");

  function build() {
    const input = {
      input: `${__dirname}/fixtures/index.js`,
      plugins: [htmlTemplate({})],
    };
    const output = {
      file: BUNDLE_PATH,
      format: "iife",
      name: "test",
    };

    return rollup(input).then(bundle => bundle.write(output));
  }

  expect(build()).rejects.toThrow(htmlTemplate.INVALID_ARGS_ERROR);
});
