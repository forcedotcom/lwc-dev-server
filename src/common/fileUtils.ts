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
 * Find specific file by iterating over the rootPath's children.
 * Checks the default path provided first.
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param defaultPath First path to check for the file
 * @param parentDir Name of the folder containing the file
 * @param fileName Name of the file we're looking for
 * @param foldersToIgnore Set of folders to ignore while scanning
 */
export function findFileWithDefaultPath(
    rootPath: string,
    defaultPath: string,
    parentDir: string,
    fileName: string,
    foldersToIgnore: Set<string> = new Set([])
): string {
    var filePath = '';
    var defaultPath = path.join(rootPath, defaultPath, parentDir, fileName);
    if (fs.existsSync(defaultPath)) {
        filePath = defaultPath;
    } else {
        var parentDirPath = findFolders(
            rootPath,
            parentDir,
            [],
            foldersToIgnore
        )[0];
        if (
            parentDirPath &&
            fs.existsSync(path.join(parentDirPath, fileName))
        ) {
            filePath = path.join(parentDirPath, fileName);
        }
    }
    return filePath;
}

/**
 * Find specific folder by iterating over the rootPath's children.
 * Checks the default path provided first.
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param defaultPath First path to check for the folder
 * @param folderName Name of the folder we're looking for
 * @param foldersToIgnore Set of folders to ignore while scanning
 */
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
 * Find all paths to target folder name given root path and directories
 * to iterate.
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param directoriesToCheck List of directories to check for target folder
 * @param targetFolder Name of the folder we're looking for
 * @param foldersToIgnore Set of folders to ignore while scanning
 */
export function findAllFolderPaths(
    rootPath: string,
    directoriesToCheck: string[],
    targetFolder: string,
    foldersToIgnore: Set<string> = new Set([])
): string[] {
    let targetFolderPaths: string[] = [];
    if (directoriesToCheck && directoriesToCheck.length > 0) {
        directoriesToCheck.forEach(directory => {
            const folderPaths = findFolders(
                path.join(rootPath, directory),
                targetFolder,
                [],
                foldersToIgnore
            );
            // Determines where to insert the new item
            const pathIndex =
                targetFolderPaths.length > 0 ? targetFolderPaths.length - 1 : 0;
            // Adds the path to the current list of items
            targetFolderPaths.splice(pathIndex, 0, ...folderPaths);
        });
    }
    return targetFolderPaths;
}

/**
 * Find specific folder by iterating over the rootPath's children.
 * Returns all matches.
 *
 * @param rootPath Parent path where to start looking for a folder
 * @param folderName Name of the folder we're looking for
 * @param folderArray Paths where we've found the folderName
 * @param foldersToIgnore Set of folders to ignore while scanning
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
                    folderArray,
                    foldersToIgnore
                );
            }
        }
    }
    return folderArray;
}

/**
 * Get the contents of the specified file.
 *
 * @param filePath path to file
 */
export function getFileContents(filePath: string): string | null {
    let contents = null;
    if (fs.existsSync(filePath)) {
        try {
            contents = fs.readFileSync(filePath, 'utf-8');
        } catch (e) {
            console.error(
                `Loading ${filePath} failed parsing with error ${e.message}`
            );
        }
    }
    return contents;
}
