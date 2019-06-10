// jest doesn't transform the testEnvironment config property, so we have to
// transform it ourselves for now...
require('ts-node/register');
module.exports = require('./AuthenticatedEnvironment.ts');
