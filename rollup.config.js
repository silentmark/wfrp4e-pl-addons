import fs from 'fs';
import foundryPath from './foundry-path.mjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const manifest = JSON.parse(fs.readFileSync('./module.json'));
const modulePath = foundryPath(manifest.id);

console.log('Bundling to ' + modulePath);

export default {
    input: [
        'scripts/main.mjs'
    ],
    output: {
        dir: './dist'
    },
    plugins: [
        nodeResolve()
    ],
    watch: {
        chokidar: {
            usePolling: true,
            interval: 200
        }
    },
    onwarn(warning, warn) {
        if (warning.code === 'EVAL') {
            return;
        }
        warn(warning);
    }
};