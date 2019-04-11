
import LocalDevServerContainer from '../containers/LocalDevServerContainer';
import LocalDevServerCompileResult from './LocalDevServerCompileResult';
import LocalDevServerDependencyManager from '../dependencies/LocalDevServerDependencyManager';
import LocalDevServerConfiguration from '../user/LocalDevServerConfiguration';
import LocalDevServerCachingStrategy from '../caching/LocalDevServerCachingStrategy';

import { compile as lwcCompiler } from '@lwc/compiler';

class LocalDevServerCompiler {
    private dependencyManager: LocalDevServerDependencyManager;
    private configurationManager: LocalDevServerConfiguration;
    //private cachingStrategy: CommonCache;
    //private loaderStrategy: PlaygroundCompilerLoadingStrategy;

    constructor(
        dependencyManager: LocalDevServerDependencyManager,
        //cachingStrategy: CommonCache,
        // loaderStrategy: PlaygroundCompilerLoadingStrategy,
    ) {
        this.dependencyManager = dependencyManager;
        //this.cachingStrategy = cachingStrategy;
        //this.loaderStrategy = loaderStrategy;
    }

    /**
     * Main Entry point for the compile phase
     */
    public async compile(
        customNamespace: string,
        mainModule: string,
        { minify, compat }: { minify?: boolean; compat?: boolean },
    ): Promise<LocalDevServerCompileResult> {
        console.log(`compiling ${customNamespace}-${mainModule}`);

        // Use whatever dependency we downloaded.
        // This won't necessarily be specified anywhere by the user.
        // Maybe allow configuration in a JSON file for internal developers.
        const compiler = this.getLwcCompilerFromDependencies();

        // There are all lower level concerns.
        // For us, we'll only have one dependency for each of these installed.
        // At some point we need to resolve this.
        const lwcVersion = this.dependencyManager.getDependencyVersion(
            'lwc-framework',
        );

        // The componentsVersion property is used for caching.
        // We can get both this and componentsPath at the same time from the dependency manager.
        const componentsVersion = this.dependencyManager.getDependencyVersion(
            'lwc-components-lightning',
        );
        const componentsPath = this.dependencyManager.getDependencyPath(
            'lwc-components-lightning',
        );
        const sldsVersion = this.dependencyManager.getDependencyVersion('slds');

        // We need a files strategy as well, since it'll be different for playground vs duck burrito
        // Do we load the content and pass it to the compiler?
        // or do we specify the file locations?
        // The compiler is using vfs to deal with these, so need to abstract
        // the concept enough we can use vfs or real files.

        //const files: {};

        let compiledResult: LocalDevServerCompileResult;

        try {
            // Call Compile and get the resulting payload.
            // Payload should include the following
            // - Success / Fail
            // - Errors if failed. These need to be the error that communicates how to proceed. "Something went wrong" is unacceptable.
            // - JS of the app.js
            // - Be Idempotent
            //
            // This method should not do the following
            // - Write contents to the filesystem.
            const compilePass = null;

            // Need to configure that it passed, and that there were no errors.
            // Feels like we should also return the compiled app.js text.
            compiledResult = new LocalDevServerCompileResult(
                compilePass.code,
                compilePass.map,
            );
        } catch (ex) {
            // TODO: I don't like this method signature.
            compiledResult = new LocalDevServerCompileResult(null, null, [ex]);
        }

        console.log(
            `compiling ${customNamespace}-${mainModule} finished. success = ${!compiledResult.hasError}`,
        );

        return compiledResult;
    }

    private getSourceCodeAsFiles() {
        return {};
    }

    private getLwcCompilerFromDependencies() {
        // TODO: load from actual dependencies instead of hardcode
        return { };
    }
}

export default LocalDevServerCompiler;
