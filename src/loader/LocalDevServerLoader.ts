import { PlaygroundCompilerLoadingStrategy } from 'playground-compiler-rollup';
class LocalDevServerLoader implements PlaygroundCompilerLoadingStrategy {
    async load(id: string) {
        return '';
    }
}

export default LocalDevServerLoader;
