# Local Development (Duck Burrito)

## Happy Path Setup for lwc-recipies

```
git clone git@git.soma.salesforce.com:communities/talon.git
cd talon
yarn install
yarn build
yarn link-talon

cd ..
git clone git@github.com:forcedotcom/lwc-dev-server.git
cd lwc-dev-server
yarn install
yarn link-talon
yarn build

cd ..
git clone git@github.com:trailheadapps/lwc-recipes.git
cd lwc-recipies
cp -R force-app/main/default/lwc force-app/main/default/c
```

## Launch lwc-recipies
Run the following command from the lwc-recipies directory
{PATH_TO_LOCAL_DEV_TOOLS}/local-dev-tools/bin/run force:lightning:lwc:dev

Go to: http://localhost:3333/


# NOTE: The Instructions below aren't fully up to date. Please follow the happy path above if you are trying to demo

## Usage in your project
To get Local Development for your tools follow the following steps.

```console
npm add local-dev-server -D
npm install
# This of course will improve
./node_modules/local-dev-tools/packages/local-dev-server/bin/run [server|help]
```

## Configuration
To configure the local-dev-server, supply a localdevserver.config.json file at the base of your project.

The following configuration parameters are available.

```json5
{
    // What namespace to use referencing your Lightning Web Components
    "namespace": "c",

    // Which component is the default to preview.
    "main": "app", 

    // Where are your component files. If you have a namespace, specify the directory the namespace folder is in.
    "moduleSourceDirectory": "...", 

    // Name of the component to load in the default container
    "main": "...",

    // The address port for your local server. Defaults to 3333
    "port": 3333
}
```

## Contributing

```console
git clone git@github.com:forcedotcom/local-dev-tools.git
cd local-dev-tools
yarn install
yarn build
```

### link talon

```console
cd ~/git/talon
yarn link-talon
cd ~/git/local-dev-server
yarn link-talon
```

As you are making changes, you'll probably want 

```console
# Watch for changes to source files and recompile.
yarn watch

# Watch for changes to files and run tests
yarn test:watch
```

### Updating Talon Dependnecies

Certain dependencies from nexus such as @talon dependencies and lgc components are temporarily include from tarballs checked into the repo. This will be done until those packages are available on public npm. These tarball versions can be updated via script:

```bash
script/update-local-deps.js
```

This will download new jars and update the package.json file.


### SFDX Plugin

build the oclif manifest
```console
yarn oclif-dev manifest
```

See [SFDX Readme](SFDX_plugin.md)
