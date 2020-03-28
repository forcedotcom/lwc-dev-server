import { DynamicImport, RuntimeCompilerMetadata } from '@webruntime/compiler';

// Needs exporting from @webruntime/api
interface ResourceMetadata {
    dependencies: string[];
    dynamicImports?: string[];
}

/**
 * What the metadata from the compiler returns and what the
 * AddressableService request() method expects as a return value are inconsistent.
 * This class takes the compiler metadata and converts it to what request() expects.
 *
 * TODO: Should eventually be fixed in LWR. Lets file an issue
 */
export class CompilerResourceMetadata implements ResourceMetadata {
    readonly dependencies: string[];
    readonly dynamicImports: string[];

    constructor(metadata: RuntimeCompilerMetadata | undefined) {
        if (metadata) {
            this.dependencies = metadata.dependencies || [];
            this.dynamicImports = metadata.dynamicImports
                ? metadata.dynamicImports.map((item: DynamicImport) => {
                      return `${item.specifier}?pivots=${item.pivots.join(
                          ','
                      )}`;
                  })
                : [];
        } else {
            this.dependencies = [];
            this.dynamicImports = [];
        }
    }
}
