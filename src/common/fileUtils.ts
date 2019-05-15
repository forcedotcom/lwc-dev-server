import { cp, mkdir } from 'shelljs';

export function copyFiles(source: string, dest: string) {
    try {
        mkdir('-p', dest);
        cp('-R', source, dest);
    } catch (e) {
        console.error(`warning - unable to copy assets: ${e}`);
    }
}
