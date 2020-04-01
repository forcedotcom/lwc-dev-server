declare module '@webruntime/compiler';

import { CompilerOutput } from '@lwc/compiler/dist/types/compiler/compiler';
import {
    BundleFiles,
    DynamicComponentConfig,
    NormalizedOutputConfig,
    StylesheetConfig,
    TransformOptions
} from '@lwc/compiler/dist/types/options';
import { CompilerDiagnostic } from '@lwc/errors';
import { ModuleFormat, Plugin } from 'rollup';
export interface InlineConfig {
    descriptor: string;
    exclude?: string[];
}
interface AmdFormatConfig {
    define: string;
}
export interface FormatConfig {
    amd: AmdFormatConfig;
}
export declare type CompilerPlugin = Plugin;
export declare type LwcPluginOptions = {
    rootDir?: string;
    modules?: string[];
    exclude?: any[];
    stylesheetConfig?: StylesheetConfig;
    experimentalDynamicComponent?: DynamicComponentConfig;
};
/**
 * @noInheritDoc
 */
export interface RuntimeCompilerOptions extends Partial<TransformOptions> {
    files?: BundleFiles;
    input?: string;
    format?: ModuleFormat;
    formatConfig?: FormatConfig;
    plugins?: CompilerPlugin[];
    external?: Function | string[];
    inlineConfig?: (string | InlineConfig)[];
    lwcOptions?: LwcPluginOptions;
}
/**
 * @noInheritDoc
 */
export interface NormalizedRuntimeCompilerOptions
    extends Required<RuntimeCompilerOptions> {
    outputConfig: NormalizedOutputConfig;
}
export interface RuntimeCompilerDiagnostic extends CompilerDiagnostic {
    originalError: Error;
}
export interface DynamicImport {
    specifier: string;
    pivots: string[];
}
export interface RuntimeCompilerMetadata {
    dependencies: string[];
    dynamicImports: DynamicImport[];
}
/**
 * @noInheritDoc
 */
export interface RuntimeCompilerOutput extends CompilerOutput {
    metadata?: RuntimeCompilerMetadata;
}
export {};

/**
 * Create a client-side bundle based on the given config.
 *
 * @param options - Compiler config (see README for object documentation)
 */
export declare function compile(
    options: RuntimeCompilerOptions
): Promise<RuntimeCompilerOutput>;

/* Extend the LWC CompilerConfig validation to have files be optional.
 *
 * @param options - Configuration passed into the Compiler
 * /
export declare function validateOptions(options: RuntimeCompilerOptions): NormalizedRuntimeCompilerOptions;
/**
 * Return an external function Rollup, based on the current module ID and Compiler config.
 *
 * @param moduleId - The ID of the module being built (eg: 'x/foo')
 * @param inlineConfig - Inline config array passed into the Compiler
 * @param external - External array passed into the Compiler
 *
 * @returns - A function which returns true or false if a given ID should be an external dependency
 */
export declare function createExternals(
    moduleId?: string,
    inlineConfig?: (string | InlineConfig)[],
    external?: Function | string[]
): Function;
/**
 * Turn the array of strings into an array of DynamicImport objects.
 * @example
 *          'x/footer?pivots=route:about,route:home' =>
 *          { specifier: 'x/foo', pivots: ['route:about','locale:es'] }
 *
 * @param specifier - A module specifier to parse for a pivots query parameter
 */
export declare function parsePivots(specifier?: string): DynamicImport;

import { DiagnosticLevel } from '@lwc/errors';
export declare const compilerMessages: {
    COMPILE_ERROR: {
        code: number;
        message: string;
        level: DiagnosticLevel;
        url: string;
    };
};

export declare class LoadingCache {
    constructor(loader?: Function);
    get(key: string, loader?: Function): any;
    getValues(): any[];
    invalidateAll(): void;
}

export declare class CompilerResourceMetadata {
    constructor(metadata: RuntimeCompilerMetadata | undefined);
    dependencies: string[];
    dynamicImports: string[];
}
