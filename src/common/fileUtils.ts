import { cp, mkdir, rm } from 'shelljs';
import fs from 'fs';
import path from 'path';

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

/**
 * Collection of folder names we ignore
 * when searching for a folder in a project
 */
const foldersToIgnore = new Set([
    'aura',
    'lwc',
    'classes',
    'triggers',
    'layouts',
    'objects'
]);

/**
 * Find specific folder by iterate over rootPath's children
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param folderName Name of the folder we're looking for
 * @param folderArray Paths where we've found the folderName
 */
export function findFolders(
    rootPath: string,
    folderName: string,
    folderArray: string[]
) {
    const dirChildren = fs.readdirSync(rootPath);
    // avoid scanning elements from foldersToIgnore set
    const filteredDirChildren = dirChildren.filter(item => {
        return !foldersToIgnore.has(item);
    });
    folderArray = folderArray || [];

    for (let i = 0; i < filteredDirChildren.length; i++) {
        const file = filteredDirChildren[i];

        if (fs.statSync(path.join(rootPath, file)).isDirectory()) {
            if (file === folderName) {
                folderArray.push(path.join(rootPath, file));
                break;
            } else {
                folderArray = findFolders(
                    path.join(rootPath, file),
                    folderName,
                    folderArray
                );
            }
        }
    }
    return folderArray;
}
