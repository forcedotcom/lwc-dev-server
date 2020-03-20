import express, { Application } from 'express';
import { sessionNonce } from '../sessionNonce';

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

describe('sessionNonce', () => {
    const nonce = 'sessionNonce';

    it('should return a LWR extension', () => {
        const extension = sessionNonce(nonce);

        expect(extension).toHaveProperty('extendApp');
    });

    describe('extendApp', () => {
        let app: Application;

        beforeEach(() => {
            app = express();
        });

        it('should add the session nonce to response locals', () => {
            const extension = sessionNonce(nonce);

            extension.extendApp({ app });

            // @ts-ignore
            const callback = app.use.mock.calls[0][0];

            const res = {
                locals: {
                    sessionNonce: ''
                }
            };
            const next = () => {};

            callback(undefined, res, next);

            expect(res.locals.sessionNonce).toEqual(nonce);
        });
    });
});
