import { Request, Response, NextFunction } from 'express';
import { AppExtensionConfig } from '@webruntime/api';

export function sessionNonce(sessionNonce: string) {
    return {
        extendApp: ({ app }: AppExtensionConfig) => {
            // @ts-ignore
            app.use((req: Request, res: Response, next: NextFunction) => {
                res.locals.sessionNonce = sessionNonce;
                next();
            });
        }
    };
}
