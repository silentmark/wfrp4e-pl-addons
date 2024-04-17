import {exec} from "child_process";
import { readdirSync } from 'fs'

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
const paths = getDirectories('./packs');
for (const path of paths) {
    exec(`fvtt package pack ${path}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Packing Error: ${error}`);
            return;
          }
          console.log(stdout);
          console.error(stderr);
    });
}
