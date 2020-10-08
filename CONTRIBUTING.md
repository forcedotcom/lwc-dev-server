# Contributing

Clone the repo and build:

```sh
git clone git@github.com:forcedotcom/lwc-dev-server.git
cd lwc-dev-server
yarn
```

As you are making changes, you'll probably want to enable `watch` in a separate terminal window:

```sh
# Watch for changes to source files and recompile.
yarn watch

# Watch for changes to files and run tests
yarn test:watch
```

Otherwise you will need to run `yarn build` after making any changes.

## Links

-   [CircleCI](https://circleci.com/gh/forcedotcom/lwc-dev-server)

## Running Lightning Web Runtime from Source

From the same directory where you cloned this project, clone the webruntime repo:

```sh
git clone git@git.soma.salesforce.com:communities/webruntime.git
cd webruntime
yarn install
yarn build
yarn link-webruntime

cd ../lwc-dev-server
yarn link-webruntime
yarn build
```

You can view packages registered for linking under `~/.config/yarn/link`:

```console
$ ls -lR  ~/.config/yarn/link
total 0
drwxr-xr-x  5 nmcwilliams  wheel  160 May  9 14:35 @webruntime
lrwxr-xr-x  1 nmcwilliams  wheel   68 Mar 20 18:05 lightning-lsp-common -> ../../../dev/lightning-language-server/packages/lightning-lsp-common
lrwxr-xr-x  1 nmcwilliams  wheel   37 May  9 14:35 webruntime-e2e -> ../../../dev/webruntime/packages/webruntime-e2e
lrwxr-xr-x  1 nmcwilliams  wheel   45 Apr 26 12:24 webruntime-integration -> ../../../dev/webruntime/packages/webruntime-integration
lrwxr-xr-x  1 nmcwilliams  wheel   52 May  9 14:35 webruntime-template-flashhelp -> ../../../dev/webruntime/packages/webruntime-template-flashhelp

/Users/nmcwilliams/.config/yarn/link/@webruntime:
total 0
lrwxr-xr-x  1 nmcwilliams  wheel  43 May  9 14:35 common -> ../../../../dev/webruntime/packages/webruntime-common
lrwxr-xr-x  1 nmcwilliams  wheel  45 May  9 14:35 compiler -> ../../../../dev/webruntime/packages/webruntime-compiler
lrwxr-xr-x  1 nmcwilliams  wheel  46 May  9 14:35 framework -> ../../../../dev/webruntime/packages/webruntime-framework
```

And you can view which packages are currently linked:

```console
$ find node_modules -type l | grep -v .bin
node_modules/@webruntime/framework
node_modules/@webruntime/common
node_modules/@webruntime/compiler
```

To unlink webruntime:

```console
yarn unlink-webruntime
yarn install && yarn build
```

## Committing

1. We enforce commit message format. We recommend using [commitizen](https://github.com/commitizen/cz-cli) by installing it with `npm install -g commitizen` and running `npm run commit-init`. When you commit, we recommend that you use `npm run commit`, which prompts you with a series of questions to format the commit message. Or you can use our VS Code Task `Commit`.
1. The commit message format that we expect is: `type: commit message`. Valid types are: feat, fix, improvement, docs, style, refactor, perf, test, build, ci, chore and revert.
1. Before commit and push, Husky runs several hooks to ensure the commit message is in the correct format and that everything lints and compiles properly.

## Publishing

We use the `npm version` command to update the package.json version based on [semver](https://docs.npmjs.com/about-semantic-versioning).

### Publishing Publicly

#### 1) Update the Version

For backwards-compatible bug fixes:

```sh
npm version patch
```

For backwards-compatible features and bug fixes:

```sh
npm version minor
```

#### 2) Push to NPM

Currently we work with Jason Grantham to manually push signed packages to npmjs.com every Thursday.

### Publishing an Internal Testing Version

Versions for internal testing can be pushed to the [internal SFDX npm registry](http://platform-cli-registry.eng.sfdc.net:4880/#/). Before you can publish you need to add yourself as a user if you haven't already:

```sh
npm adduser --registry http://platform-cli-registry.eng.sfdc.net:4880
```

This will prompt you for a username, password and email, then save the authToken to `~/.npmrc`. This only has to be done once.

Use `npm version` with prerelease, preminor, prepatch etc. as appropriate. With prerelease use `--preid=beta`.

For example, to go from `1.0.0` to `1.0.1-beta.0` or `1.0.1-beta.0` to `1.0.1-beta.1`:

```sh
npm version prerelease --preid=beta
```

Then publish it:

```sh
npm publish --registry http://platform-cli-registry.eng.sfdc.net:4880
```

To use this version users will need to add the internal registries to their PATH:

```sh
export SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880'
export SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli'
```

Or alternatively run the plugin with these variables set:

```sh
SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli' SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880' sfdx plugins:install @salesforce/lwc-dev-server
```

## Tests

### Running Specific Tests

You can pass in a pattern or a test filename after `yarn test` to run just a specific test, for example:

```sh
yarn test dev.test.ts # will only run tests in this file
```

For integration tests use `test:e2e`:

```sh
yarn test:e2e dependencies # will run dependencies.test.ts
```

Jest has [many other options](https://jestjs.io/docs/en/cli#running-from-the-command-line) for selecting which tests to run as well.

### Integration Tests

Integration tests can specify a jest docblock prama to choose the environment and other parameters.

Specify the environment:

```js
/**
 * @jest-environment ./environment/DefaultEnvironment.js
 */
```

Specify the project folder (defaults to `./project`):

```js
/**
 * @project ../relative/path/to/project
 */
```

See the [specific environment typescript files](/integration-tests/environment) for more documentation on available parameters for tests using that environment.

### Debugging

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `force:lightning:lwc:start` command:

1. Start the inspector

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx force:lightning:lwc:start --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run force:lightning:lwc:start
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).

Congrats, you are debugging!

#### Debugging Integration Tests

Add this line to your test:

```js
await browser.debug();
```

It will leave the browser open and you can REPL in the terminal (e.g., use `$` to find elements on the page). In this case you will want to temporarily increase the timeout with `jest.setTimeout` in your test file, or when running the test set the `DEBUG` environment variable which will increase the timeout to one day:

```sh
DEBUG=true yarn test:e2e test-file
DEBUG=localdevserver* yarn test:e2e test-file
```
