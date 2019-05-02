import { Command, flags } from '@oclif/command';
import LocalDevServer from '../../LocalDevServer';
import Project from '../../common/Project';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';
import fs from 'fs';

export default class Server extends Command {
    static description = 'start the Lightning Local Development server';

    //   static examples = [
    //     `$ example-multi-ts hello
    // hello world from ./src/hello.ts!
    // `,
    //   ]

    static flags = {
        help: flags.help({ char: 'h' })
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
        const configuration = project.getConfiguration();

        // Takes the configured values from the JSON file and applies
        // the values from the CLI run
        configuration.configureFromCliArguments(args);

        const main = configuration.getEntryPointComponent();

        if (!project.isSfdx() && !fs.existsSync(project.getDirectory())) {
            console.error(
                `Failed starting local dev server in directory: ${project.getDirectory()}.
                 No project could be found in the current or parent directory.`
            );
            process.exit();
        }

        console.log(
            `Starting the local dev server in directory: ${project.getDirectory()} with component: ${main}`
        );

        this.startServer(project, main);
    }

    private startServer(project: Project, main: string) {
        //import localDevServer from './dist/LocalDevServer.js';

        // We're about to do something.
        console.log(`Running local dev server with the config values`);
        console.dir({
            directory: project.getDirectory(),
            moduleSourceDirectory: project.getModuleSourceDirectory(),
            main: main,
            namespace: project.getConfiguration().namespace,
            containerType: project.getConfiguration().getContainerType()
        });

        const localDevServer = new LocalDevServer();

        // Run Local Dev Server

        // Do we need build?
        // Start seems sufficient.
        localDevServer.build();

        // Start the server?
        localDevServer.start(project, main);

        // Yay! We did it.
        console.log('Done running local dev tools.');
    }
}
