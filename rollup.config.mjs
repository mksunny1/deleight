import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";
// import typescript from '@rollup/plugin-typescript';

import { writeFile, mkdir } from "fs/promises";

function createCommonJsPackage() {
  const pkg = { type: "commonjs" };
  return {
    name: "cjs-package",
    buildEnd: async () => {
      await mkdir("./dist/cjs", { recursive: true });
      await writeFile("./dist/cjs/package.json", JSON.stringify(pkg, null, 2));
    },
  };
}

export default [
  {
    input: [
      "./src/domitory.js",
      "./src/eventivity.js",
      "./src/appliance.js",
      "./src/actribute.js",
      "./src/apriori.js",
      "./src/generational.js",
      "./src/sophistry.js",
      "./src/onetomany.js",
      "./src/withy.js",
    ],
    plugins: [
      copy({
        targets: [{ src: "./package.json", dest: "dist" }],
      }),
      createCommonJsPackage(),
      // terser()
    ],
    output: [
      { format: "es", dir: "./dist/esm" },
      { format: "cjs", dir: "./dist/cjs" },
    ],
  },
  {
    input: "./src/deleight.ts",
    plugins: [dts()],
    output: {
      format: "es",
      file: "./dist/deleight.d.ts",
    },
  },
];
