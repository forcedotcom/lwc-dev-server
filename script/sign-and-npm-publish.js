#!/usr/bin/env node
const { execSync } = require('child_process'); // under-the-hood run npm pack
// and sign the tarball
const execOutput = execSync(`npx sfdx-trust plugins:trust:sign \
  --signatureurl https://developer.salesforce.com/media/salesforce-cli/signatures \
  --publickeyurl https://developer.salesforce.com/media/salesforce-cli/sfdx-cli-03032020.crt \
  --privatekeypath "~/salesforce-cli.key" --json
`);
// exit if signing returns empty
if (execOutput.length === 0)
    throw new Error('plugins:trust:sign returned no ouput');
const { result } = JSON.parse(execOutput); // post signiture to aws
execSync(
    `aws s3 cp ${result.filename} s3://dfc-data-production/media/salesforce-cli/signatures/`
);
// publish to npm
// using npm vs yarn since yarn does not support npmignore mixed with package.json config
execSync(`npm publish ${result.tarPath}`); // alert if signing failed
execSync('sleep 30'); // wait 30 seconds for npm to register the new version
execSync(
    `npx sfdx-trust plugins:trust:verify --npm ${result.name}@${result.version} --json`
);