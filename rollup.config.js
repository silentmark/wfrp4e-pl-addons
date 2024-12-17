import fs from "fs";
import path from "path";
import watch from "rollup-plugin-watch";
import foundryPath from "./foundry-path.mjs";
import jscc from 'rollup-plugin-jscc';
import { nodeResolve } from '@rollup/plugin-node-resolve';

let manifest = JSON.parse(fs.readFileSync("./module.json"))

let modulePath = foundryPath(manifest.name)

console.log("Bundling to " + modulePath)
export default {
    input: [
        "scripts/armour.mjs",
        "scripts/auto-combat.mjs",
        "scripts/auto-counterspell.mjs",
        "scripts/auto-engaged.mjs",
        "scripts/auto-miss.mjs",
        "scripts/auto-outnumbered.mjs",
        "scripts/auto-rotate.mjs",
        "scripts/constants.mjs",
        "scripts/helper.mjs",
        "scripts/main.mjs",
        "scripts/miscasts.mjs",
        "scripts/pf2e-heresy.mjs",
        "scripts/prayer-nerf.mjs",
        "scripts/reroll-initiative.mjs",
        "scripts/windsofmagic.mjs",
        "scripts/diseases.mjs",
        "scripts/socket-tests.mjs"
    ],
    output: {
        dir : path.join(modulePath, "dist")
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