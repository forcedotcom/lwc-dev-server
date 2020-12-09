import express, { Application } from 'express';
import { projectMetadata } from '../projectMetadata';
import Project from '../../../common/Project';
import { ExtensionOptions } from '@webruntime/api';
import path from 'path';
import * as fileUtils from '../../../common/fileUtils';
import fs from 'fs';
import mockFs from 'mock-fs';

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
            const extension = projectMetadata(nonce, project);
            extension.extendApp({ app, options });

            jest.spyOn(fileUtils, 'removeFile').mockImplementation();

            const devFolder = path.join(
                project.projectDirectory,
                '.localdevserver',
                'webruntime',
                'custom-component',
                'dev',
                'en-US'
            );
            const devFile = path.join(devFolder, 'c', 'sample.js');

            mockFs({
                [`${project.projectDirectory}/package.json`]: JSON.stringify({
                    name: 'test-project'
                }),
                [`${devFile}`]: 'errors you do not want'
            });

            const req: any = {
                url: `/localdev/${nonce}/localdev.js`,
                params: {
                    '0': 'localdev.js'
                }
            };
            const res: any = {
                type: jest.fn(),
                send: jest.fn()
            };
            const next = jest.fn();

            // @ts-ignore
            const routeHandler = (app.get as jest.Mock).mock.calls[0][1];
            routeHandler(req, res, next);

            expect(fileUtils.removeFile).toHaveBeenCalledTimes(1);
            expect(fileUtils.removeFile).toHaveBeenCalledWith(devFolder);
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
