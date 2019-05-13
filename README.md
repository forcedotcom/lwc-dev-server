# Local Development (Duck Burrito)

[![CircleCI](https://circleci.com/gh/forcedotcom/lwc-dev-server.svg?style=svg&circle-token=19ea057fcc409cec956c360fc347b727d0429396)](https://circleci.com/gh/forcedotcom/lwc-dev-server)
[![codecov](https://codecov.io/gh/forcedotcom/lwc-dev-server/branch/master/graph/badge.svg?token=LJxxclDlYz)](https://codecov.io/gh/forcedotcom/lwc-dev-server)

Local Development lets you run an LWC-enabled server on your local machine and view live changes to components without pushing to your org.

## LWC Recipes Happy Path

Currently the best way to test this project is with [LWC Recipes](https://github.com/trailheadapps/lwc-recipes). After cloning, a few temporary steps are required:

```sh
git clone git@github.com:trailheadapps/lwc-recipes.git
cd lwc-recipes
cp -R force-app/main/default/lwc force-app/main/default/c
```

After this follow the usage instructions for [SFDX CLI](#sfdx-cli).

## Usage

### SFDX CLI

You must be on the internal network or the VPN in order to install the plugin or get updates.

#### Installation

The plugin is installed from the internal SFDX npm registry. You can point the CLI to this registry by setting the `SFDX_NPM_REGISTRY` environment variable. For example, in your `~/.bash_profile` file add this line:

```sh
export SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880'
```

Afterwards open a new terminal window and install:

```sh
sfdx plugins:install lwc-dev-server
```

*Note: you will get a notice that the plugin is not digitally signed and asking whether to continue installation. Enter 'y'.*

If you do not edit `.bash_profile` you can alternatively specify it inline:

```sh
SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880' sfdx plugins:install lwc-dev-server
```
Installation will take a few minutes which is something we will improve. 

#### Running the Plugin

At the moment the plugin **must be run within an SFDX project**, such as [LWC Recipes](https://github.com/trailheadapps/lwc-recipes).

Start the server:

```sh
SFDX_COMPILE_CACHE=false sfdx force:lightning:lwc:dev
```

Once it's started, visit [http://localhost:3333](http://localhost:3333) in your browser.

For more information on the command see the [SFDX_plugin.md](SFDX_plugin.md) file.

##### Notes

`SFDX_COMPILE_CACHE` is temporary and due to a [bug in the SFDX CLI](https://git.soma.salesforce.com/salesforcedx/cli/issues/188). To avoid exposing this detail in a demo you can export this in your `~/.bash_profile`:

```sh
export SFDX_COMPILE_CACHE=false
```

#### Updating the Plugin

New "stable" versions of the plugin will be pushed to the internal SFDX npm registry. Grab it like so:

```sh
sfdx plugins:update
```

### As a Package Dependency

Coming later.

### From Source

With linking you can run the latest code from source with the SFDX CLI.

Clone this repo:
```sh
git clone git@github.com:forcedotcom/lwc-dev-server.git
```

Next build the project:
```sh
cd lwc-dev-server
yarn install && yarn build
```

From within the lwc-dev-server directory, link it with the SFDX CLI:
```sh
sfdx plugins:link
```

You can verify that it was linked propery by running `sfdx plugins`:

```sh-session
$ sfdx plugins
@salesforce/ui-api 0.1.2
lwc-dev-server 1.0.0 (link) /Users/nmcwilliams/dev/lwc-dev-server
├─ @oclif/plugin-update 1.3.9 (link) /Users/nmcwilliams/dev/lwc-dev-server/node_modules/@oclif/plugin-update
└─ @oclif/plugin-help 2.1.6 (link) /Users/nmcwilliams/dev/lwc-dev-server/node_modules/@oclif/plugin-help

salesforcedx 45.13.1-0 (release)
├─ force-language-services 45.9.1-0
└─ salesforce-alm 45.15.1-1
```

#### Running Talon From Source

Occasionally when running from source you might also need to run Talon from source due to updates there. Steps to do this are in [CONTRIBUTING.md](CONTRIBUTING.md#running-talon-from-source).

## Troubleshooting

```sh-session
$ sfdx force:lightning:lwc:dev
(node:78804) [ENOENT] Error: spawn lwc-dev-server ENOENT
ERROR running force:lightning:lwc:dev:  Must pass a username and/or OAuth options when creating an AuthInfo instance.
```

You need to ensure you authenticate to your devhub via SFDX and create a scratch org.
In lwc-recipes we have a scratch org json file, just create one from that.

## Configuration for Projects (WIP)

Projects can provide configuration information for the server. Supply a localdevserver.config.json file at the base of your project.

The following configuration parameters are available.

```json5
{
    // What namespace to use referencing your Lightning Web Components
    "namespace": "c",

    // Name of the component to load in the default container
    "main": "app", 

    // Where are your component files. If you have a namespace, specify the directory the namespace folder is in.
    "moduleSourceDirectory": "src/", 

    // The address port for your local server. Defaults to 3333
    "port": 3333
}
```

## Remaining Work Before TDX Demo

### Open 
| Work ID | Dev | Description |
| ------- | --- | ----------- |
| W-6071012 | Kris | Local Development DRB
| W-6067203 | Nathan | Static assets (like slds, images, etc) can be loaded by local dev server
| W-6067236 | Kris | Configuration of Local Development
| W-6067321 | Totten | Talon Packaged in Public NPM
| W-6091628 | Nathan | [Duck Burrito] SFDX -Generate build artifacts automatically from CI
| W-6092668 | Nathan | Integration with SFDX and distribution strategy
| W-6105664 | ? | Custom static assets for SFDX projects
| W-6124443 | Nick | Record data proxy to org
| W-6067267 | Min | Graceful error container when viewing components with compile errors
| W-6124774 | Luke | Support c namespace mapping to file based namespace in local development

### Fixed (Not Closed)
| Work ID | Dev | Description |
| ------- | --- | ----------- |
| W-6066419 | Nick | Bootstrap Talon Server
| W-6092390 | Nick | List of components on the landing page
| W-6066586 | Nathan | Enable CircleCI for Local Development
| W-6072909 | Nathan | SFDX CLI Plugin
| W-6072978 | Luke | Use SFDX authentication token with Talon

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
