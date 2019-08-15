# Local Development (Duck Burrito)

[![CircleCI](https://circleci.com/gh/forcedotcom/lwc-dev-server.svg?style=svg&circle-token=19ea057fcc409cec956c360fc347b727d0429396)](https://circleci.com/gh/forcedotcom/lwc-dev-server)
[![Build status](https://ci.appveyor.com/api/projects/status/ix3iloviwyyg4agt/branch/master?svg=true)](https://ci.appveyor.com/project/forcedotcom/lwc-dev-server/branch/master)
[![codecov](https://codecov.io/gh/forcedotcom/lwc-dev-server/branch/master/graph/badge.svg?token=LJxxclDlYz)](https://codecov.io/gh/forcedotcom/lwc-dev-server)

Local Development lets you run an LWC-enabled server on your local machine and view live changes to components without pushing to your org.

# Setup

## Quick Start

Currently the best way to test this project is with [LWC Recipes](https://github.com/trailheadapps/lwc-recipes). These setup steps will get you started using lwc-dev-server if you've never installed it previously. For more detailed instructions / explanations, read the Usage section below.

```sh
SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli' SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880' sfdx plugins:install lwc-dev-server
git clone git@github.com:trailheadapps/lwc-recipes.git
cd lwc-recipes
sfdx force:auth:web:login -d -a myhuborg
sfdx force:lightning:lwc:start
```
Now your local server should be started -> http://localhost:3333/

## Usage

### SFDX CLI

You must be on the internal network or the VPN in order to install the plugin or get updates.

### Installation

The plugin is installed from the internal SFDX npm registry. You can point the CLI to this registry by setting the `SFDX_NPM_REGISTRY` environment variable. For example, in your `~/.bash_profile` file add this line:

```sh
export SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880'
export SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli'
```

Afterwards open a new terminal window and install:

```sh
sfdx plugins:install lwc-dev-server
```

*Note: you will get a notice that the plugin is not digitally signed and asking whether to continue installation. Enter 'y'.*

If you do not edit `.bash_profile` you can alternatively specify it inline:

```sh
SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli' SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880' sfdx plugins:install lwc-dev-server
```
Installation will take a few minutes which is something we will improve. 

### Updates

New "stable" versions of the plugin will be pushed to the internal SFDX npm registry. Grab it like so:

```sh
SFDX_S3_HOST='http://10.252.156.165:9000/sfdx/media/salesforce-cli' SFDX_NPM_REGISTRY='http://platform-cli-registry.eng.sfdc.net:4880' sfdx plugins:update
```

### Running lwc-dev-server

At the moment the plugin **must be run within an SFDX project**, such as [LWC Recipes](https://github.com/trailheadapps/lwc-recipes).

Start the server:

```sh
sfdx force:lightning:lwc:start
```

Once it's started, visit [http://localhost:3333](http://localhost:3333) in your browser.

For more information on the command see the [SFDX_plugin.md](SFDX_plugin.md) file.

### Running from Source

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
Note you can also unlink the plugins by running the unlink command from the same directory:
```sh
sfdx plugins:unlink
```

## Troubleshooting

```sh-session
$ sfdx force:lightning:lwc:start
(node:78804) [ENOENT] Error: spawn lwc-dev-server ENOENT
ERROR running force:lightning:lwc:start:  Must pass a username and/or OAuth options when creating an AuthInfo instance.
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
    "modulesSourceDirectory": "src/", 

    // Where are your static assets.
    "staticResourcesDirectory": "",

    // Optional path to the custom labels file
    "customLabelsFile": "labels/CustomLabels.labels-meta.xml",

    // The address port for your local server. Defaults to 3333
    "port": 3333,

    "api_version": 47,

    "endpoint": "...",
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
