import path from 'path';
import fs from 'fs';

export const fallbackVersionKey = '1';

/**
 * TODO: move to LocalDevApp
 * Returns the version key for the local dev app's static resources.
 *
 * This uses the version from the lwc-dev-server package.json file.
 */
export function getWebAppVersionKey(): string {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    try {
        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
        );
        if (packageJson.version) {
            return packageJson.version;
        } else {
            throw new Error(
                'version is not specified in the package.json file'
            );
        }
    } catch (e) {
        console.warn(
            `Unable to determine the versionKey of the app from ${packageJsonPath}: ${e.message}`
        );
        return fallbackVersionKey;
    }
}
