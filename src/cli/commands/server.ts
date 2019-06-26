import { Command, flags } from '@oclif/command';
import LocalDevServer from '../../server/LocalDevServer';
import Project from '../../common/Project';
import fs from 'fs';

export default class Server extends Command {
    static description = 'start the Lightning Local Development server';

    static flags = {
        help: flags.help({ char: 'h' }),
        port: flags.integer({
            char: 'p',
            description: 'port to run local dev server on'
        })
        // flag with a value (-n, --name=VALUE)
        // directory: flags.string({
        //     char: 'd',
        //     description: 'directory to start'
        // })
        // flag with no value (-f, --force)
        // force: flags.boolean({char: 'f'}),
    };

    static args = [
        { name: 'directory', default: process.cwd() },
        { name: 'main' }
    ];

    public async run() {
        const { args, flags } = this.parse(Server);
        const project = new Project(args.directory);

        // Gets the default configuration and then
        // applies the values from the configuration json file.
        const configuration = project.configuration;

        // Updates the configuration from the flags on
        // the CLI run.
        configuration.configureFromCliArguments(args);

        if (flags.port !== undefined && flags.port !== null) {
            project.configuration.port = flags.port;
        }

        const main = configuration.entryPointComponent;

        if (!project.isSfdx && !fs.existsSync(project.directory)) {
            console.error(
                `Failed starting local dev server in directory: ${
                    project.directory
                }.
                 No project could be found in the current or parent directory.`
            );
            process.exit(1);
        }

        console.log(
            `Starting the local dev server in directory: ${
                project.directory
            } with component: ${main}`
        );

        this.startServer(project, main);
    }

    private startServer(project: Project, main: string) {
        //import localDevServer from './dist/LocalDevServer.js';

        // We're about to do something.
        console.log(`Running local dev server with the config values`);
        console.dir({
            directory: project.directory,
            modulesSourceDirectory: project.modulesSourceDirectory,
            main: main,
            namespace: project.configuration.namespace,
            containerType: project.configuration.containerType
        });

        const localDevServer = new LocalDevServer();

        // Start the server
        localDevServer.start(project);

        // Yay! We did it.
        console.log('Done running local dev tools.');
    }
}
