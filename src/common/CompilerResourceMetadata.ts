import { DynamicImport, RuntimeCompilerMetadata } from '@webruntime/compiler';

// Needs exporting from @webruntime/api
interface ResourceMetadata {
    dependencies: string[];
    dynamicImports?: string[];
}

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
