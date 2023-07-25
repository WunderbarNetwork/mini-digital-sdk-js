import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "lib/node/index.mjs", // import compiled TS output
  output: [
    { name: "MiniDigital", file: "lib/bundles/mini-digital-sdk.min.umd.js", format: "umd", sourcemap: true },
    { name: "MiniDigital", file: "lib/bundles/mini-digital-sdk.min.cjs", format: "cjs", sourcemap: true },
    { name: "MiniDigital", file: "lib/bundles/mini-digital-sdk.min.mjs", format: "es", sourcemap: true },
  ],
  plugins: [
    resolve(), // include dependencies from node_modules (but not devDependencies)
    commonjs(), // enable compile to commonjs
    terser(), // minify output
  ],
};
