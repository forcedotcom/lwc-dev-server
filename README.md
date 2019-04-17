# Local Development (Duck Burrito)

## Usage in your project
To get Local Development for your tools follow the following steps.

```console
npm add local-dev-server -D
npm install
# This of course will improve
./node_modules/local-dev-server/packages/local-dev-server/bin/run [server|help]
```

## Configuration
To configure the local-dev-server, supply a localdevserver.config.json file at the base of your project.

The following configuration parameters are available.

```json
{
    "main": "..." # Name of the component to load in the default container
}
```

## Contributing

```console
git clone git@github.com:forcedotcom/local-dev-tools.git
cd local-dev-tools
yarn install
yarn build
```

As you are making changes, you'll probably want 

```console
yarn watch
```

and

```console
yarn test
```




