import { Plugin, ResolveIdResult } from 'rollup';

export interface Alias {
    find: string | RegExp;
    replacement: string;
    customResolver?: ResolverFunction | ResolverObject | null;
}

export type ResolverFunction = (
    source: string,
    importer: string | undefined
) => Promise<ResolveIdResult> | ResolveIdResult;

export interface ResolverObject {
    resolveId: ResolverFunction;
}

export interface RollupAliasOptions {
    /**
     * Instructs the plugin to use an alternative resolving algorithm,
     * rather than the Rollup's resolver.
     * @default null
     */
    customResolver?: ResolverFunction | ResolverObject | null;

    /**
     * Specifies an `Object`, or an `Array` of `Object`,
     * which defines aliases used to replace values in `import` or `require` statements.
     * With either format, the order of the entries is important,
     * in that the first defined rules are applied first.
     */
    entries?: readonly Alias[] | { [find: string]: string };
}

/**
 * 🍣 A Rollup plugin for defining aliases when bundling packages.
 */
export default function alias(options?: RollupAliasOptions): Plugin;
