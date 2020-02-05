import html from "../dist/rollup-plugin-generate-html-template.module";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "iife",
    name: "__TEST",
  },
  plugins: [
    html({
      template: "src/main.html",
      target: "index.html",
    }),
  ],
};
