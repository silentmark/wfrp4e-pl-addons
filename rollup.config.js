import { upload } from './orchestrator.mjs';

function postBuildPlugin() {
    return {
        name: 'post-build-plugin',
        async writeBundle() {
            console.log('[Rollup] Build finished. Running post-build tasks...');
            await upload();
            //await reloadAll();
        }
    };
}

export default {
    input: [
        'scripts/main.mjs'
    ],
    output: { dir: './dist' },
    watch: {
        clearScreen: false
    },
    plugins: [
        postBuildPlugin()
    ]
};