import fs from "fs";
import path from "path";
import watch from "rollup-plugin-watch";
import foundryPath from "./foundry-path.mjs";
import jscc from 'rollup-plugin-jscc';
import { nodeResolve } from '@rollup/plugin-node-resolve';

let manifest = JSON.parse(fs.readFileSync("./module.json"))

let modulePath = foundryPath(manifest.id)

console.log("Bundling to " + modulePath)
export default {
    input: [
        "scripts/main.mjs"
    ],
    output: {
        dir : "./dist"
    },
    plugins: [
        jscc({
            values : {_ENV :  process.env.NODE_ENV}
        }),
        watch({ dir: "scripts" }),
		nodeResolve()
    ],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === 'EVAL') return
        warn(warning)
    }
}