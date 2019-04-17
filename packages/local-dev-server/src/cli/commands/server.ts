import { Command, flags } from '@oclif/command';
import LocalDevServer from '../../LocalDevServer';
import Project from '../../common/Project';
import LocalDevServerConfiguration from '../../user/LocalDevServerConfiguration';

export default class Server extends Command {
    static description = 'Starts the Lightning local devevelopment server';

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

        // Use something to create this Config
        const configuration = new LocalDevServerConfiguration();

        const main = this.resolveMain(args.main, configuration);

        if (!project.isValid()) {
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

    private resolveMain(
        main: String,
        configuration: LocalDevServerConfiguration
    ): string {
        if (main !== null && main !== undefined) {
            return main.toString();
        }

        if (configuration.getEntryPointComponent() !== null) {
            return configuration.getEntryPointComponent();
        }

        return '';
    }

    private startServer(project: Project, main: string) {
        //import localDevServer from './dist/LocalDevServer.js';

        // We're about to do something.
        console.log(
            `Running local dev tools on directory: ${project.getDirectory()}`
        );

        const localDevServer = new LocalDevServer();

        // Run Local Dev Server
        localDevServer.install(project);

        // Do we need build?
        // Start seems sufficient.
        localDevServer.build();

        // Start the server?
        localDevServer.start(project, main);

        // Yay! We did it.
        console.log('Done running local dev tools.');
    }
}
