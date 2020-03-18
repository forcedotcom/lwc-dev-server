import { Application, Request, Response, NextFunction } from 'express';

export function SessionNonce(sessionNonce: string) {
    return {
        extendApp: ({ app }: { app: Application }) => {
            app.use((req: Request, res: Response, next: NextFunction) => {
                res.locals.sessionNonce = sessionNonce;
                next();
            });
        }
    };
}
