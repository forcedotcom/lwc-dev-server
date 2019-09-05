import archiver from 'archiver';
import jsforce from 'jsforce';
import fs from 'fs';
import path from 'path';

interface UploadOptions {
    /**
     * Absolute path to the package folder (e.g., force-app/main/default).
     */
    packagePath: string;
    /**
     * Existing authenticated jsforce connection.
     */
    connection: jsforce.Connection;
    /**
     * Include all files in the package directory.
     */
    all?: boolean;
    /**
     * Include the `classes` directory from the package directory.
     */
    apex?: boolean;
}

/**
 * Uploads metadata (apex classes, custom objects, etc...) to Salesforce.
 *
 * A package.xml file is required in the package directory. See
 * https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/file_based_zip_file.htm
 * for documentation and examples.
 *
 * @param options Configuration options.
 */
export async function upload(options: UploadOptions) {
    const { packagePath } = options;
    const packageXmlPath = path.join(packagePath, 'package.xml');
    const packageName = 'testpkg';

    console.log(`uploading metadata from path ${packagePath}`);

    if (!fs.existsSync(packageXmlPath)) {
        throw new Error('Missing package.xml file in package directory');
    }

    const archive = archiver('zip');
    if (options.all) {
        archive.directory(options.packagePath, packageName);
    } else {
        archive.file(packageXmlPath, {
            name: `${packageName}/package.xml`
        });
        if (options.apex) {
            archive.directory(
                path.join(packagePath, 'classes'),
                `${packageName}/classes`
            );
        }
    }
    archive.finalize();

    await options.connection.metadata
        .deploy(archive, {
            allowMissingFiles: false,
            autoUpdatePackage: false,
            ignoreWarnings: true,
            rollbackOnError: true
        })
        // @ts-ignore type def must be wrong?
        .complete({ details: true })
        .then((result: jsforce.DeployResult) => {
            console.log(JSON.stringify(result, null, 2));
            if (!result.success) {
                throw new Error('Upload did not succeed');
            }
            console.log('done uploading metadata.');
        })
        .catch((e: Error) => {
            console.error(`error uploading metadata: ${e.message}`);
        });
}
