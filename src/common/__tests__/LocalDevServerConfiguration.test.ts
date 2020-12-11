/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import LocalDevServerConfiguration from '../LocalDevServerConfiguration';
import { ServerConfiguration } from '../types';

describe('LocalDevServerConfiguration', () => {
    test('should provide all the default values', () => {
        const SRV_CONFIG: ServerConfiguration = {
            apiVersion: '49.0',
            instanceUrl: 'https://na1.salesforce.com'
        };
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            SRV_CONFIG
        );
        expect(configuration.port).toBe(3333);
        expect(configuration.api_version).toBe('49.0');
        expect(configuration.namespace).toBe('c');
        expect(configuration.core_version).toBe('226');
        expect(configuration.endpoint).toBe('https://na1.salesforce.com');
        expect(configuration.endpointHeaders).toEqual([]);
        expect(configuration.liveReload).toBe(true);
    });

    test('should handle the default value overrides', () => {
        const SRV_CONFIG: ServerConfiguration = {
            apiVersion: '51.0',
            headers: ['Authorization: Bearer kjas', 'Connection: keep-alive'],
            instanceUrl: 'https://na3.salesforce.com',
            port: 3301
        };
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            SRV_CONFIG
        );
        expect(configuration.port).toBe(3301);
        expect(configuration.api_version).toBe('51.0');
        expect(configuration.namespace).toBe('c');
        expect(configuration.core_version).toBe('230');
        expect(configuration.endpoint).toBe('https://na3.salesforce.com');
        expect(configuration.endpointHeaders).toEqual([
            'Authorization: Bearer kjas',
            'Connection: keep-alive'
        ]);
        expect(configuration.liveReload).toBe(true);
    });
});
