const fs = require("fs")
const path = require("path")
const foundryPath = require("./foundry-path.js");
import copy from 'rollup-plugin-copy-watch'

let manifest = JSON.parse(fs.readFileSync("./module.json"))

let modulePath = foundryPath.modulePath(manifest.name)

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
    ],
    output: {
        dir : path.join(modulePath, "scripts")
    },
    watch : {
        clearScreen: true
    }, 
    plugins: [
        copy({
            targets : [
                {src : "./module.json", dest : modulePath},
                {src : "./pl.json", dest : modulePath},
                {src : "./scripts/*", dest :  path.join(modulePath, "scripts")},
                {src : "./templates/*", dest : path.join(modulePath, "templates")},
                {src : "./packs/*", dest :  path.join(modulePath, "packs")},
                {src : "./icons/*", dest :  path.join(modulePath, "icons")}
            ],
            watch: ["module.json", "scripts/*", "templates/*", "packs/*", "icons/*"]
        })
    ]
}