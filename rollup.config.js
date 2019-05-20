import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
  input: "./src/index.js",
  external: ["fs", "path"],
  plugins: [
    resolve({ preferBuiltins: false }),
    commonJS({ include: "node_modules/**" }),
    babel(),
  ],
};
