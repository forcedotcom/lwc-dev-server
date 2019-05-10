import { Request, Response, NextFunction } from 'express';

export function onError(req: Request, res: Response, next: NextFunction) {
    debugger;
    return res.status(500).send('bad');
}
