import fs from 'fs';
import path from 'path';
import debugLogger from 'debug';
import { Application, Request, Response, NextFunction } from 'express';
import { AppExtensionConfig } from '@webruntime/api';

const debug = debugLogger('localdevserver:resource');

export function resourceUrl() {
    return {
        extendApp: ({ app, options }: AppExtensionConfig) => {
            (app as Application).get(
                '/assets/project/:versionKey/*',
                (req: Request, res: Response, next: NextFunction) => {
                    const assetPath = `/assets/project/${req.params[0]}`;
                    const assetFilepath = path.join(
                        options.buildDir,
                        assetPath
                    );

                    if (fs.existsSync(assetFilepath)) {
                        req.url = assetPath;
                        next();
                    } else {
                        debug(
                            `static asset '${assetFilepath}' does not exist, sending 404`
                        );
                        res.sendStatus(404);
                    }
                }
            );
        }
    };
}
