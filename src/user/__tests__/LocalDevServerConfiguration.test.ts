import LocalDevServerConfiguration from '../LocalDevServerConfiguration';
import mock from 'mock-fs';
import { config } from 'cli-ux';

describe('LocalDevServerConfiguration', () => {
    // Stop mocking 'fs' after each test
    afterEach(mock.restore);

    test('when you do not pass anything to the constructor, it proceeds without error', () => {
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration();

        expect(configuration.containerType).toBe('component');
    });

    test('when it cannot read the json file, it notifies you that an error occured.', () => {
        mock({
            'config.json': {}
        });

        console.error = jest.fn();
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        // @ts-ignore
        expect(console.error.mock.calls[0][0]).toEqual(
            'Loading file config.json failed with error: Error: EBADF: bad file descriptor, read'
        );
    });

    test('when you pass a file that is not json to the constructor, it notifies you that the file was an invalid syntax.', () => {
        mock({
            'config.json': '}{' // Invalid JSON
        });

        console.error = jest.fn();
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        // @ts-ignore
        expect(console.error.mock.calls[0][0]).toBe(
            "Loading JSON in 'config.json' failed with the error Unexpected token } in JSON at position 0"
        );
    });

    test('For SFDX projects, namespace should be c', () => {
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration();

        expect(configuration.namespace).toBe('c');
    });

    test('loading of containerType from config json', () => {
        mock({
            'config.json': JSON.stringify({
                containerType: 'my-container-type'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.containerType).toBe('my-container-type');
    });

    test('loading of entryPointComponent from config json', () => {
        mock({
            'config.json': JSON.stringify({
                main: 'main-entry-point'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.entryPointComponent).toBe('c/main-entry-point');
    });

    test('loading of fully qualified entryPointComponent from config json', () => {
        mock({
            'config.json': JSON.stringify({
                main: 'c/main-entry-point'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.entryPointComponent).toBe('c/main-entry-point');
    });

    test('default of entryPointComponent when not specified in config json', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.entryPointComponent).toBe('');
    });

    test('loading of modulesSourceDirectory from config json', () => {
        mock({
            'config.json': JSON.stringify({
                modulesSourceDirectory: '/my/directory'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.modulesSourceDirectory).toBe('/my/directory');
    });

    test('loading of staticResourcesDirectories from config json', () => {
        mock({
            'config.json': JSON.stringify({
                staticResourcesDirectories: ['/static/resources/directory']
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.staticResourcesDirectories).toStrictEqual([
            '/static/resources/directory'
        ]);
    });

    test('loading of customLabelsFile from config json', () => {
        mock({
            'config.json': JSON.stringify({
                customLabelsFile: 'labels/custom-labels.xml'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.customLabelsFile).toBe('labels/custom-labels.xml');
    });

    test('loading of port from config json', () => {
        mock({
            'config.json': JSON.stringify({
                port: 1234
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.port).toBe(1234);
    });

    test('port returns default port when not specified in config file.', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.port).toBe(3333);
    });

    test('Empty string value in config file uses default port', () => {
        mock({
            'config.json': JSON.stringify({
                port: ''
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.port).toBe(3333);
    });

    test('value of `0` in config file uses 0', () => {
        mock({
            'config.json': JSON.stringify({
                port: 0
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.port).toBe(0);
    });

    test('loading of api version from config json', () => {
        mock({
            'config.json': JSON.stringify({
                api_version: '48'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.api_version).toBe('48');
    });

    test('loading of core version from config json with api version set', () => {
        mock({
            'config.json': JSON.stringify({
                api_version: '48'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.core_version).toBe('224');
    });

    test('loading of core version from config json without api version set', () => {
        mock({
            'config.json': '{}'
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.core_version).toBe(undefined);
    });

    test('loading of endpoint from config json', () => {
        mock({
            'config.json': JSON.stringify({
                endpoint: 'http://mobile1.t.salesforce.com'
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );

        expect(configuration.endpoint).toBe('http://mobile1.t.salesforce.com');
    });

    test('able to store the endpoint headers on the config ', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const headers = ['Authorization: Bearer 123456'];
        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );
        configuration.endpointHeaders = headers;

        expect(configuration.endpointHeaders).toBe(headers);
    });

    test('setting of the config from the parsing of the CLI flags', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );
        configuration.configureFromCliArguments({ main: 'mainEntryPoint' });
        expect(configuration.entryPointComponent).toBe('c/mainEntryPoint');
    });

    test('liveReload enabled by default', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );
        expect(configuration.liveReload).toBe(true);
    });

    test('sets liveReload off when configured', () => {
        mock({
            'config.json': JSON.stringify({
                liveReload: false
            })
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );
        expect(configuration.liveReload).toBe(false);
    });

    test('liveReload can be set to disabled', () => {
        mock({
            'config.json': JSON.stringify({})
        });

        const configuration: LocalDevServerConfiguration = new LocalDevServerConfiguration(
            'config.json'
        );
        configuration.liveReload = false;
        expect(configuration.liveReload).toBe(false);
    });
});
