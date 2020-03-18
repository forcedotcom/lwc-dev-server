import express, { Application } from 'express';
import { projectMetadata } from '../projectMetadata';
import Project from '../../../common/Project';

jest.mock('../../../common/Project');

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

describe('projectMetadata', () => {
    let project: Project;
    const nonce = 'sessionNonce';

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject');
    });

    it('should return a LWR extension', () => {
        const extension = projectMetadata(nonce, project);

        expect(extension).toHaveProperty('extendApp');
    });

    describe('extendApp', () => {
        let app: Application;

        beforeEach(() => {
            app = express();
        });

        it('should add the /localdev/{{sessionNonce}}/localdev.js route', () => {
            const extension = projectMetadata(nonce, project);

            extension.extendApp({ app });

            // @ts-ignore
            const route = app.get.mock.calls[0][0];

            expect(route).toEqual(`/localdev/${nonce}/localdev.js`);
        });

        it('should add the /localdev/{{sessionNonce}}/show route', async () => {
            const extension = projectMetadata(nonce, project);

            extension.extendApp({ app });

            // @ts-ignore
            const route = app.get.mock.calls[1][0];

            expect(route).toEqual(`/localdev/${nonce}/show`);
        });
    });
});
