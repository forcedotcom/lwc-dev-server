import path from 'path';
import { Application, Request, Response, NextFunction } from 'express';
import ComponentIndex from '../../common/ComponentIndex';
import Project from '../../common/Project';
import { AppExtensionConfig } from '@webruntime/api';
import fs from 'fs';
import { removeFile } from '../../common/fileUtils';

const ALLOWED_SHOW_EXTENSIONS: { [key: string]: boolean } = {
    '.html': true,
    '.css': true,
    '.js': true
};

export function projectMetadata(sessionNonce: string, project: Project) {
    return {
        extendApp: ({ app }: AppExtensionConfig) => {
            (app as Application).get(
                `/localdev/${sessionNonce}/localdev.js`,
                (req: Request, res: Response, next: NextFunction) => {
                    removeFile(path.join(project.projectDirectory, '.localdevserver', 'webruntime', 'custom-component', 'dev', 'en-US'));

                    const componentIndex = new ComponentIndex(project);
                    const json = componentIndex.getProjectMetadata();
                    const localDevConfig = {
                        project: json
                    };
                    res.type('js');
                    res.send(
                        `window.LocalDev = ${JSON.stringify(localDevConfig)};`
                    );
                }
            );

            (app as Application).get(
                `/localdev/${sessionNonce}/errorDetails`,
                (req: Request, res: Response, next: NextFunction) => {
                    const specifier = req.query.specifier as string;
                    const specifierRegex = RegExp('c/[a-zA-Z]*', 'g');
                    if (!specifierRegex.test(specifier)) {
                        res.json({
                            errors: [
                                {
                                    message:
                                        'The component specifier format is incorrect'
                                }
                            ]
                        });
                        return;
                    }
                    // NOTE: Some of the info used below is set on WebRuntimeConfig.ts
                    // but not available here, might want to move some of it to Project.ts config
                    const normalizedFile = path.join(
                        project.projectDirectory,
                        '.localdevserver',
                        'webruntime',
                        'custom-component',
                        'dev',
                        'en-US',
                        `${specifier}.js`
                    );

                    if (!fs.existsSync(normalizedFile)) {
                        res.json({
                            errors: [
                                {
                                    message:
                                        "Couldn't find the compiled component. If this component has a dependency on a component in the org or a component in a package in the org, test this component directly in the org."
                                }
                            ]
                        });
                        return;
                    }
                    const content = fs.readFileSync(normalizedFile);
                    const stringContent = content.toString();

                    res.json(JSON.parse(stringContent));
                }
            );
        }
    };
}
