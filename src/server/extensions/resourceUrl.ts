import { Application, Request, Response, NextFunction } from 'express';
import { AppExtensionConfig } from '@webruntime/api';

export function resourceUrl(outputDir: string) {
    return {
        extendApp: ({ app }: AppExtensionConfig) => {
            (app as Application).get(
                '/assets/project/:versionKey/*',
                (req: Request, res: Response, next: NextFunction) => {
                    // TODO: check that requested file is in the project and exists, otherwise return 404.
                    req.url = `/assets/project/${req.params[0]}`;
                    next('route');
                }
            );
        }
    };
}
