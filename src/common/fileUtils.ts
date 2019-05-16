import { cp, mkdir, rm } from 'shelljs';
import fs from 'fs';

/**
 * Copies source to dest.
 *
 * To copy only the files in a directory and not the directory itself use a
 * source like `directory/*`.
 *
 * @param source The source file or directory to copy.
 * @param dest The destination.
 */
export function copyFiles(source: string, dest: string) {
    mkdir('-p', dest);
    cp('-R', source, dest);
}

/**
 * Recursively removes a directory or file. Does nothing if the file doesn't
 * exist.
 *
 * @param file The path of the directory or file to remove.
 */
export function removeFile(file: string) {
    if (fs.existsSync(file)) {
        rm('-rf', file);
    }
}
