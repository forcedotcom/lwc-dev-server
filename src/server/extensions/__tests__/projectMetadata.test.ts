import express, { Application } from 'express';
import { projectMetadata } from '../projectMetadata';
import Project from '../../../common/Project';
import { ExtensionOptions } from '@webruntime/api';
import path from 'path';
// import * as fileUtils from '../../../common/fileUtils';
import fs from 'fs';
import mockFs from 'mock-fs';

jest.mock('../../../common/Project');

// jest.mock('../../../common/fileUtils');

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
    // let fileUtilsDeleteMock: any;
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
        let options: ExtensionOptions;

        beforeEach(() => {
            app = express();
        });

        it('should add the /localdev/{{sessionNonce}}/localdev.js route', () => {
            const extension = projectMetadata(nonce, project);

            extension.extendApp({ app, options });

            // @ts-ignore
            const route = app.get.mock.calls[0][0];

            expect(route).toEqual(`/localdev/${nonce}/localdev.js`);
        });

        it('should clear dev folder for localdev.js route', () => {
            const devFolder = path.join(
                project.projectDirectory,
                '.localdevserver',
                'webruntime',
                'dev',
                'en-US'
            );
            const extension = projectMetadata(nonce, project);
            mockFs({
                [`${devFolder}`]: {}
            });
            expect(fs.existsSync(devFolder)).toBeTruthy();

            extension.extendApp({ app, options });

            // @ts-ignore
            app.use.mock.calls[0][0];

            expect(fs.existsSync(devFolder)).toBeFalsy();
        });

        it('should add the /localdev/{{sessionNonce}}errorDetails route', async () => {
            const extension = projectMetadata(nonce, project);

            extension.extendApp({ app, options });

            // @ts-ignore
            const route = app.get.mock.calls[1][0];

            expect(route).toEqual(`/localdev/${nonce}/errorDetails`);
        });
    });
});
