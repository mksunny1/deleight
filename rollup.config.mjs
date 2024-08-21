import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
// import typescript from '@rollup/plugin-typescript';

import { writeFile, mkdir } from "fs/promises";

function createPackage(src) {
    const pkg = { types: `./${src}.d.ts` };
    return {
        name: `${src}`,
        buildEnd: async () => {
            await mkdir(`dist/${src}/esm`, { recursive: true });
            await writeFile(`./dist/${src}/esm/package.json`, JSON.stringify(pkg, null, 2));
        },
    };
}

function createCommonJsPackage(src) {
    const pkg = { type: "commonjs" };
    return {
        name: "cjs-package",
        buildEnd: async () => {
            await mkdir(`dist/${src}/cjs`, { recursive: true });
            await writeFile(`./dist/${src}/cjs/package.json`, JSON.stringify(pkg, null, 2));
        },
    };
}

const sources = [
    "apption",
    "actribute",
    "onetomany",
    "generational",
    "queryoperator",
    "apriori",
    "sophistry",
    "eutility",
    "appliance",
    "withly",
];

const exports = [];
let extraPlugins;
for (let [i, src] of sources.entries()) {
    exports.push({
        input: `./src/${src}.js`,
        output: [
            { format: "es", file: `./dist/${src}/esm/${src}.js`},
            { format: "cjs", file: `./dist/${src}/cjs/${src}.js`},
        ],
        plugins: [
            createPackage(src),
            createCommonJsPackage(src),
            terser()
        ]

    }, {
        input: `./src/${src}.ts`,
        plugins: [dts()],
        output: [
            { format: "es", file: `./dist/${src}/esm/${src}.d.ts`},
            { format: "cjs", file: `./dist/${src}/cjs/${src}.d.ts`},
        ]
    })
}

export default exports;

