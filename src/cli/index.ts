const yargs = require('yargs');

const parser = yargs
    .scriptName('talon')
    .usage('Local Development Service CLI\n\nUsage: $0 command [option]')
    .wrap(null)
    .commandDir('.', { include: /command-.*/ })
    .demandCommand()
    .strict();

if (require.main === module) {
    parser.parse(process.argv.slice(2));
}
