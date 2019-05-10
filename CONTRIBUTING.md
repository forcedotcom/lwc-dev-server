# Contributing

Clone the repo and build:
```sh
git clone git@github.com:forcedotcom/lwc-dev-server.git
cd lwc-dev-server
yarn install && yarn build
```

As you are making changes, you'll probably want to enable `watch` in a separate terminal window:

```sh
# Watch for changes to source files and recompile.
yarn watch

# Watch for changes to files and run tests
yarn test:watch
```
Otherwise you will need to run `yarn build` after making any changes.

Start up the test project:

```sh
yarn start:todo
```

## Links

- [CircleCI](https://circleci.com/gh/forcedotcom)

## Running Talon from Source

From the same directory where you cloned this project, clone the talon repo:

```sh
git clone git@git.soma.salesforce.com:communities/talon.git
cd talon
yarn install
yarn build
yarn link-talon

cd ../lwc-dev-server
yarn link-talon
yarn build
```

You can view packages registered for linking under `~/.config/yarn/link`:

```console
$ ls -lR  ~/.config/yarn/link
total 0
drwxr-xr-x  5 nmcwilliams  wheel  160 May  9 14:35 @talon
lrwxr-xr-x  1 nmcwilliams  wheel   68 Mar 20 18:05 lightning-lsp-common -> ../../../dev/lightning-language-server/packages/lightning-lsp-common
lrwxr-xr-x  1 nmcwilliams  wheel   37 May  9 14:35 talon-e2e -> ../../../dev/talon/packages/talon-e2e
lrwxr-xr-x  1 nmcwilliams  wheel   45 Apr 26 12:24 talon-integration -> ../../../dev/talon/packages/talon-integration
lrwxr-xr-x  1 nmcwilliams  wheel   52 May  9 14:35 talon-template-flashhelp -> ../../../dev/talon/packages/talon-template-flashhelp

/Users/nmcwilliams/.config/yarn/link/@talon:
total 0
lrwxr-xr-x  1 nmcwilliams  wheel  43 May  9 14:35 common -> ../../../../dev/talon/packages/talon-common
lrwxr-xr-x  1 nmcwilliams  wheel  45 May  9 14:35 compiler -> ../../../../dev/talon/packages/talon-compiler
lrwxr-xr-x  1 nmcwilliams  wheel  46 May  9 14:35 framework -> ../../../../dev/talon/packages/talon-framework
```

And you can view which packages are currently linked:

```console
$ find node_modules -type l | grep -v .bin
node_modules/@talon/framework
node_modules/@talon/common
node_modules/@talon/compiler
```

## Updating Talon/Local Dependencies

Non-public dependencies from nexus such as @talon and lwc-components-lightning are temporarily consumed as tarballs checked into this repo. This will be done until those packages are available on public npm.

Update everything to the 'latest' from nexus:

```sh
script/update-all.js
```

Update a specific package:

```sh
npm pack package@version --registry https://nexus.soma.salesforce.com/nexus/content/groups/npm-all/
```

Move the downloaded tarball to `lib` and delete the old one. Then install:

```sh
yarn install
```

### Caveats

This process is hacky (hopefully temporary). Roughly speaking:

1. The tarballs are unpacked to folders during `install` via the postinstall script.
2. During unpacking any packages that depend on other private dependencies (e.g., @talon/compiler -> @talon/common) are modified to point to the local version.
3. `yarn add` is called on each of the unpacked directories, which will install them and their dependencies into `node_modules` 

The client follows the same steps after `yarn add lwc-dev-server` is called-- i.e., the postinstall script is run and the local tarballs are unpacked and added.

## Publishing

New stable versions are pushed to the [internal SFDX npm registry](http://platform-cli-registry.eng.sfdc.net:4880/#/). Before you can publish you need to add yourself as a user if you haven't already:

```sh
npm adduser --registry http://platform-cli-registry.eng.sfdc.net:4880
```

This will prompt you for a username, password and email, then save the authToken to `~/.npmrc`. This only has to be done once.

To publish, first bump the package version. For example: 

```sh
npm version patch
```

Then publish it:
```sh
npm publish --registry http://platform-cli-registry.eng.sfdc.net:4880
```