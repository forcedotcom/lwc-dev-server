import { Command, flags } from '@oclif/command';
import LocalDevServer from '../../LocalDevServer';

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

    static args = [{ name: 'directory', default: process.cwd() }];

    async run() {
        const { args, flags } = this.parse(Server);
        this.startServer(args.directory);
    }

    startServer(directory: string) {
        //import localDevServer from './dist/LocalDevServer.js';

        // We're about to do something.
        console.log(`Running local dev tools on directory: ${directory}`);

        const localDevServer = new LocalDevServer();

        // Run Local Dev Server
        localDevServer.install();

        // Do we need build?
        // Start seems sufficient.
        localDevServer.build();

        // Start the server?
        localDevServer.start(directory);

        // Yay! We did it.
        console.log('Done running local dev tools.');
    }
}
