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
 * Determines the path to a file with given parent folder. First attempts
 * to find the file in the default location. If the file is not found,
 * searches through the folders at the given base path until it finds the
 * parent folder. We will return the path if the file is present in the folder.
 * @param rootPath Parent path where to start looking for a folder
 * @param defaultPath Default path for this file
 * @param folderName Name of the folder we're looking for
 * @param fileName Name of the file we're looking for
 */
export function findFileWithDefaultPath(
    rootPath: string,
    defaultPath: string,
    parentDir: string,
    fileName: string
): string {
    var filePath = '';
    var defaultPath = path.join(rootPath, defaultPath, parentDir, fileName);
    if (fs.existsSync(defaultPath)) {
        filePath = defaultPath;
    } else {
        var parentDirPath = findFolders(rootPath, parentDir, [])[0];
        if (
            parentDirPath &&
            fs.existsSync(path.join(parentDirPath, fileName))
        ) {
            filePath = path.join(parentDirPath, fileName);
        }
    }
    return filePath;
}

export function findFolderWithDefaultPath(
    rootPath: string,
    defaultPath: string,
    folderName: string,
    foldersToIgnore: Set<string> = new Set([])
) {
    var folderPath = '';
    var defaultPath = path.join(rootPath, defaultPath, folderName);
    if (fs.existsSync(defaultPath) && fs.statSync(defaultPath).isDirectory()) {
        folderPath = defaultPath;
    } else {
        folderPath = findFolders(rootPath, folderName, [], foldersToIgnore)[0];
    }
    return folderPath;
}

/**
 * Find specific folder by iterate over rootPath's children
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param folderName Name of the folder we're looking for
 * @param folderArray Paths where we've found the folderName
 * @param foldersToIgnore Set of folders to ignore scanning
 */
export function findFolders(
    rootPath: string,
    folderName: string,
    folderArray: string[] = [],
    foldersToIgnore: Set<string> = new Set([])
) {
    if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
        return folderArray;
    }

    const dirChildren = fs.readdirSync(rootPath);
    // avoid scanning elements from foldersToIgnore set
    const filteredDirChildren = dirChildren.filter(item => {
        return !foldersToIgnore.has(item);
    });

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

export function getFileContents(filePath: string): string | null {
    let contents = null;
    try {
        contents = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.error(
            `Loading ${filePath} failed parsing with error ${e.message}`
        );
    }
    return contents;
}
