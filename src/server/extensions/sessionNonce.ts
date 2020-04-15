import { Application, Request, Response, NextFunction } from 'express';
import { AppExtensionConfig } from '@webruntime/api';

export function sessionNonce(sessionNonce: string) {
    return {
        extendApp: ({ app }: AppExtensionConfig) => {
            (app as Application).use(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.sessionNonce = sessionNonce;
                    next();
                }
            );
        }
    };
}
