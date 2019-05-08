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
```
{FILL_IN_YOUR_PATH_TO_LWC_DEV_SERVER}/lwc-dev-server/bin/run force:lightning:lwc:dev
```

Go to: http://localhost:3333/

## Remaining Work

### Open 
W-6071012 - [Kris] Local Development DRB \
W-6067203 - [Nathan] Static assets (like slds, images, etc) can be loaded by local dev server \
W-6067236 - [Kris] Configuration of Local Development \
W-6067321 - [Totten] Talon Packaged in Public NPM \
W-6072909 - [Nathan] SFDX CLI Plugin \
W-6072978 - [Luke] Use SFDX authentication token with Talon \
W-6091628 - [Nathan] [Duck Burrito] SFDX -Generate build artifacts automatically from CI \
W-6092668 - [Nathan] Integration with SFDX and distribution strategy \
W-6105664 - [?] Custom static assets for SFDX projects \
W-6124443 - [Nick] Record data proxy to org \
W-6067267 - [Min] Graceful error container when viewing components with compile errors \
W-6124774 - [Luke] Support c namespace mapping to file based namespace in local development \

### Fixed (Not Closed)
W-6066419 - [Nick] Bootstrap Talon Server \
W-6092390 - [Nick] List of components on the landing page \
W-6066586 - [Nathan] Enable CircleCI for Local Development \



## Trouble Shooting

```
$ ~/Dev/lwc-dev-server/bin/run force:lightning:lwc:dev
(node:78804) [ENOENT] Error: spawn lwc-dev-server ENOENT
ERROR running force:lightning:lwc:dev:  Must pass a username and/or OAuth options when creating an AuthInfo instance.
```

You need to ensure you authenticate to your devhub via Sfdx and create a scratch org.
In lwc-recipies we have a scratch org json file, just create one from that.


# NOTE: The Instructions below aren't fully up to date. Please follow the happy path above if you are trying to demo

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
