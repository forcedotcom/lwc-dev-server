import { ConfigAggregator, Org } from '@salesforce/core';

export default class CLIErrorResolver {
    private org: Org;
    private configAggregator: ConfigAggregator;

    constructor(org: Org, configAggregator: ConfigAggregator) {
        this.org = org;
        this.configAggregator = configAggregator;
    }

    public parse(sfdxError: Error): string {
        switch (sfdxError.message) {
            // Various things could have happened
            case 'AuthInfoCreationError: Must pass a username and/or OAuth options when creating an AuthInfo instance.':
                return this.parseAuthInfoCreationError(sfdxError);

            // They specified a username that we have not logged into yet
            case 'NamedOrgNotFound: No AuthInfo found for name kris@justise.com':
                return sfdxError.message;
        }

        return `No match: ${sfdxError}`;
    }

    private parseAuthInfoCreationError(error: Error): string {
        // Do we have a dev hub org?
        // Do we have a username?
        // Try to refresh auth?

        return `Parsed Error: ${error}`;
    }
}
