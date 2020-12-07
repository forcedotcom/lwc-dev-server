//@ts-ignore
import { ComponentService } from '@webruntime/services';

const MODULE_EXCLUSIONS = new Set(['@salesforce/label']);

/**
 * The ComponentService from webruntime provides mappings for
 * resolutions it encounters when scanning the package dependencies.
 *
 * We want to be able to provide mappings later for those dependencies so we need to remove
 * any earlier resolved mappings that we care about (specified in the MODULE_EXCLUSIONS set).
 */
export class ComponentServiceWithExclusions extends ComponentService {
    async initialize() {
        await super.initialize();

        MODULE_EXCLUSIONS.forEach(exclusion => {
            // @ts-ignore
            if (this.mappings.hasOwnProperty(exclusion)) {
                // @ts-ignore
                delete this.mappings[exclusion];
            }
        });
    }
}
