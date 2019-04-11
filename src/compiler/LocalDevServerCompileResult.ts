import { SourceMap } from '@lwc/compiler/dist/types/compiler/compiler';

class LocalDevServerCompileResult {
    private readonly code: string;
    private readonly sourceMap: SourceMap;
    private readonly errors: object[] = [];

    constructor(code: string, sourceMap?: SourceMap, errors?: Error[]) {
        this.code = code;
        this.sourceMap = sourceMap;

        if (Array.isArray(errors)) {
            this.errors = errors;
        }
    }

    /**
     * Main Entry point for the compile phase
     */
    public get hasError() {
        return this.errors.length > 0;
    }
}

export default LocalDevServerCompileResult;
