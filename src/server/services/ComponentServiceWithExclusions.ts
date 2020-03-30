import { ComponentService } from '@webruntime/services';

const MODULE_EXCLUSIONS = new Set(['@salesforce/label']);

/**
 * We're extending the ComponentService from @webruntime/services as it imports
 * resolvers from the lightning base components package.
 * One of those resolvers is for @salesforce/labels which prevents us
 * from adding a resolver for that later.
 *
 */
export class ComponentServiceWithExclusions extends ComponentService {
    async initialize() {
        await super.initialize();

        MODULE_EXCLUSIONS.forEach(exclusion => {
            if (this.mappings.hasOwnProperty(exclusion)) {
                delete this.mappings[exclusion];
            }
        });
    }
}
