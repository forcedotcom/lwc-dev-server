import path from 'path';
import { Application, Request, Response, NextFunction } from 'express';
import ComponentIndex from '../../common/ComponentIndex';
import Project from '../../common/Project';

const ALLOWED_SHOW_EXTENSIONS: { [key: string]: boolean } = {
    '.html': true,
    '.css': true,
    '.js': true
};

export function ProjectMetadata(sessionNonce: string, project: Project) {
    return {
        extendApp: ({ app }: { app: Application }) => {
            app.get(
                `/localdev/${sessionNonce}/localdev.js`,
                (req: Request, res: Response, next: NextFunction) => {
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

            app.get(
                `/localdev/${sessionNonce}/show`,
                (req: Request, res: Response, next: NextFunction) => {
                    const file = req.query.file;
                    const extension = path.extname(file);
                    const normalizedFile = path.normalize(file);
                    if (
                        normalizedFile.startsWith(
                            path.normalize(project.modulesSourceDirectory)
                        ) &&
                        ALLOWED_SHOW_EXTENSIONS[extension]
                    ) {
                        res.sendFile(file);
                    }
                }
            );
        }
    };
}
