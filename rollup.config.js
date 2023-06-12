import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "lib/node/index.mjs", // import compiled TS output
  output: [
    { name: "miniDigitalSdk", file: "lib/browser/mini-digital-sdk.umd.js", format: "umd", sourcemap: true },
    { name: "miniDigitalSdk", file: "lib/browser/mini-digital-sdk.cjs.js", format: "cjs", sourcemap: true },
    { name: "miniDigitalSdk", file: "lib/browser/mini-digital-sdk.esm.js", format: "es", sourcemap: true },
  ],
  plugins: [
    resolve(), // include dependencies from node_modules (but not devDependencies)
    commonjs(), // enable compile to commonjs
    terser(), // minify output
  ],
};
