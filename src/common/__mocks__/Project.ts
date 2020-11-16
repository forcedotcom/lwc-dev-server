import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

export default jest.fn().mockImplementation(projectDirectory => {
    const configuration = new LocalDevServerConfiguration();

    configuration.port = 3000;
    configuration.api_version = '45.0';
    configuration.liveReload = true;

    return {
        projectDirectory,
        configuration,
        modulesSourceDirectory: 'src/modules'
    };
});
