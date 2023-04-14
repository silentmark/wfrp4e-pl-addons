const fs = require("fs")
const path = require("path")
const foundryPath = require("./foundry-path.js");
import copy from 'rollup-plugin-copy-watch'

let manifest = JSON.parse(fs.readFileSync("./module.json"))

let modulePath = foundryPath.modulePath(manifest.name)

console.log("Bundling to " + modulePath)
export default {
    input: [
        "scripts/ammoReplenish.js", "scripts/armour.js", "scripts/armour.js", "scripts/settings.js", "scripts/windsofmagic.js"
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