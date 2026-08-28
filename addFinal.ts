import fs from 'fs';

import config from "./config.json";


export function addFinal() {
    fs.copyFileSync('CNAME', `${config.outDir}/CNAME`);
}
