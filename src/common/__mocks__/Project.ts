/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import LocalDevServerConfiguration from '../LocalDevServerConfiguration';
import { ServerConfiguration } from '../types';

export default jest.fn().mockImplementation(projectDirectory => {
    const SRV_CONFIG: ServerConfiguration = {
        apiVersion: '45.0',
        instanceUrl: 'https://na1.salesforce.com',
        port: 3000
    };
    const configuration = new LocalDevServerConfiguration(SRV_CONFIG);

    return {
        projectDirectory,
        serverDirectory: 'server/dir',
        configuration,
        modulesSourceDirectory: 'src/modules',
        staticResourcesDirectories: [
            'src/staticResourceOne',
            'src/staticResourceTwo'
        ],
        contentAssetsDirectories: ['src/contentAssetDir']
    };
});
