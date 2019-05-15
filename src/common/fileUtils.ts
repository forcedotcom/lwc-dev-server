import { cp, mkdir, rm } from 'shelljs';
import fs from 'fs';

export function copyFiles(source: string, dest: string) {
    try {
        mkdir('-p', dest);
        cp('-R', source, dest);
    } catch (e) {
        console.error(`warning - unable to copy assets: ${e}`);
    }
}

export function removeDirectory(directoryPath: string) {
    if (fs.existsSync(directoryPath)) {
        rm('-rf', directoryPath);
    }
}
