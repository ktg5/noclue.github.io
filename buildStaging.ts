import path from 'path';
import { fileURLToPath } from "url";
import fs from "fs";
import { rmStaging } from './rmStaging';

import config from "./config.json";


const __filename = fileURLToPath(import.meta.url);
// @ts-ignore
const __dirname = path.dirname(__filename);


function getDir(dir:string):fs.Dirent[] {
    return fs.readdirSync(dir, { withFileTypes: true });
}

/**
 * copy files so that linux moment doesn't happen
 */
async function copyFileStream(src: string, dest: string) {
    await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(src);
        const writeStream = fs.createWriteStream(dest);

        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("close", resolve);

        readStream.pipe(writeStream);
    });
}

/**
 * copy directory to new directory
 */
export async function copyDir(sourceDir: string, newDir: string):Promise<void> {
    // Get dirs in the project folder.
    var dirs = getDir(sourceDir);
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'dist' ||
            entry.name === 'build.js' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'package.json' ||
            entry.name === '.ignore'
        ) continue;

        // Paths
        var sourcePath = path.join(sourceDir, entry.name);
        var newPath = path.join(newDir, entry.name);
        switch (entry.name) {
            case "tobethereadme":
                newPath = path.join(newDir, "README");
            break;
        }

        // If the files passed the vibe check, we go.
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            await copyFileStream(sourcePath, newPath);
        }
    }
}


export async function buildStaging():Promise<void> {
    // replace the "<*-- class --*>" strings in whatever into something in the switch case within this function
    function replaceMatches(match: string, tag: string):Promise<string> {
        return new Promise(async (resolve) => {
            switch (tag) {
                // site defaults
                case 'viewport':
                    resolve(`<meta name="viewport" content="width=device-width, initial-scale=.8">`);
                return;


                // default error message
                default:
                resolve(`<kbd>buildStaging.ts:replaceMatches :: unknown match: ${match}</kbd>`);
            }
        });
    }

    async function replaceHtml(dir: string, base = dir):Promise<void> {
        return new Promise<void>(async (resolve) => {
            for (const file of getDir(dir)) {
                const fullPath = path.join(dir, file.name);
                const stat = fs.statSync(fullPath);
        
                // run in dir if is a dir
                // + ignore defaults dir
                if (
                    stat.isDirectory()
                    && file.name !== "defs"
                ) replaceHtml(fullPath, base);
                else if (
                    file.name.endsWith('.html')
                    && !file.name.startsWith('_')
                ) {
                    let output = "";
                    const fileText = fs.readFileSync(fullPath, { encoding: 'utf-8' });


                    // replace matches for each file if found
                    const regex = /<\*--\s*(.*?)\s*--\*>/g;
                    let lastIndex = 0;
                    // use matchall cause the function for getting the text is a promise
                    for (const match of fileText.matchAll(regex)) {
                        const [fullMatch, tag] = match;
                        const index = match.index!;
                        output += fileText.slice(lastIndex, index);

                        const replacement = await replaceMatches(fullMatch, tag);
                        output += replacement;
                        lastIndex = index + fullMatch.length;
                    }
                    output += fileText.slice(lastIndex);

                    
                    // write
                    fs.writeFileSync(fullPath, output, { encoding: 'utf-8' });
                }
            }

            resolve();
        });
    };


    return new Promise<void>((resolve) => {      
        // copy current html folder
        if (fs.existsSync(config.stagingHtmlDir)) rmStaging();
        console.log(`🔃 copying current "${config.baseHtmlDir}" folder to a "${config.stagingHtmlDir}" for Vite to compile...`);
        copyDir(config.baseHtmlDir, config.stagingHtmlDir).then(async () => {
            console.log('✅ copy complete!');


            // replace the html within the staging folder
            console.log('🔃 changing html stuff...');
            await replaceHtml(path.resolve(__dirname, config.stagingHtmlDir));
            console.log('✅ replaced html lines!');


            // end
            resolve();
        });
    });
}
