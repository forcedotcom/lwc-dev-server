/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import express, { Application } from 'express';
import { projectMetadata } from '../projectMetadata';
import Project from '../../../common/Project';
import { ExtensionOptions } from '@webruntime/api';
import { ServerConfiguration } from '../../../common/types';

jest.mock('../../../common/Project');

jest.mock('express', () => {
    return jest.fn(() => {
        return {
            get: jest.fn(),
            use: jest.fn()
        };
    });
});

const SRV_CONFIG: ServerConfiguration = {
    apiVersion: '49.0',
    instanceUrl: 'http://test.instance.url',
    headers: ['Authorization: Bearer testingAccessToken']
};

describe('projectMetadata', () => {
    let project: Project;
    const nonce = 'sessionNonce';

    beforeEach(() => {
        project = new Project('/Users/arya/dev/myproject', SRV_CONFIG);
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

        it('should add the /localdev/{{sessionNonce}}errorDetails route', async () => {
            const extension = projectMetadata(nonce, project);

            extension.extendApp({ app, options });

            // @ts-ignore
            const route = app.get.mock.calls[1][0];

            expect(route).toEqual(`/localdev/${nonce}/errorDetails`);
        });
    });
});
