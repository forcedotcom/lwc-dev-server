import fs from 'fs';
import path from 'path';
import debugLogger from 'debug';
import mimeTypes from 'mime-types';
import xmlParser from 'fast-xml-parser';
import { Application, Request, Response, NextFunction } from 'express';
import { AppExtensionConfig } from '@webruntime/api';

const debug = debugLogger('localdevserver:resource');

/**
 * Determines the file extension for the given static asset, based on the
 * resource-meta.xml file at the same location.
 *
 * @param baseFilePath Absolute path to the static asset, without an extension.
 *
 * @returns The file extension, or null if the resource-meta.xml file cannot be
 * read or does not specify a recognized mime-type.
 */
function getStaticResourceFileExt(baseFilePath: string) {
    const resourceMetaPath = `${baseFilePath}.resource-meta.xml`;

    if (fs.existsSync(resourceMetaPath)) {
        try {
            const data = fs.readFileSync(resourceMetaPath, 'utf8');
            const result = xmlParser.parse(data, {}, true);
            if (!result.StaticResource || !result.StaticResource.contentType) {
                throw new Error('The contentType is missing');
            }
            const contentType = result.StaticResource.contentType;
            return mimeTypes.extension(contentType);
        } catch (e) {
            console.warn(
                `Unable to determine the static resource file type from ${resourceMetaPath}: ${e.message}`
            );
        }
    }

    return null;
}

export function resourceUrl() {
    return {
        extendApp: ({ app, options }: AppExtensionConfig) => {
            (app as Application).get(
                '/assets/project/:versionKey/*',
                (req: Request, res: Response, next: NextFunction) => {
                    let urlPath = `/assets/project/${req.params[0]}`;
                    let assetFilePath = path.join(options.buildDir, urlPath);

                    // when the static resource url doesn't have a file
                    // extension then it appears we're supposed to infer it from
                    // the related resource-meta.xml file.
                    //
                    // examples from lwc-recipes:
                    // - libsMomentjs.js imports and uses
                    //   '@salesforce/resourceUrl/moment' directly.
                    // - miscStaticResource.js imports and uses
                    //   '@salesforce/resourceUrl/trailhead_logo' directly.
                    if (!path.extname(req.url)) {
                        const fileExt = getStaticResourceFileExt(assetFilePath);
                        if (fileExt) {
                            urlPath = `${urlPath}.${fileExt}`;
                            assetFilePath = `${assetFilePath}.${fileExt}`;
                        }
                    }

                    if (fs.existsSync(assetFilePath)) {
                        req.url = urlPath;
                        next();
                    } else {
                        debug(
                            `static asset '${assetFilePath}' does not exist, sending 404`
                        );
                        res.sendStatus(404);
                    }
                }
            );
        }
    };
}
