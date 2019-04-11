import fs from 'fs';
import http from 'http';
import LocalDevServerCompiler from './compiler/LocalDevServerCompiler';
import LocalDevServerConfiguration from './user/LocalDevServerConfiguration';
import LocalDevServerDependencyManager from './dependencies/LocalDevServerDependencyManager';
import LocalDevServerContainer from './containers/LocalDevServerContainer';
import LocalDevServerCachingStrategy from './caching/LocalDevServerCachingStrategy';
import LocalDevServerCompileResult from './compiler/LocalDevServerCompileResult';
import LocalDevServerLoader from './loader/LocalDevServerLoader';

// Start a file watcher
// On file change, run playground container

// Where the local dev server will look for source code changes.
const customerSourceCode =
    '/Users/nkruk/git/duckburrito/lwc-todomvc/src/todo/app';

// Default port, should make this configurable.
const port = 8080;
const hostname = '127.0.0.1';

// User specified configuration
// Json file?
const configuration = new LocalDevServerConfiguration(/* source */);

// Manager for Dependencies, which will for Local Dev Server be installed on the file system.
// For Playground, we get those from caches.
const dependencyManager = new LocalDevServerDependencyManager();

// Loads from File System or Via Http
// Dependencies and Source Files
const loader = new LocalDevServerLoader();

// How we plan to cache compiled assets.
// Filesystem? Memory?
const cachingStrategy = new LocalDevServerCachingStrategy();

// Create the Compiler instance that will know everything it has to know
// to compile the output for the user.
// const compiler = new LocalDevServerCompiler(customerSourceCode);
const compiler = new LocalDevServerCompiler(
    dependencyManager
    // cachingStrategy,
    // loader,
);

let lastCompileResult: LocalDevServerCompileResult = null;

// Start watching for changes to the source code
// So that we can tell the Local Dev Server to compile the changes and
// update the preview if its open.
fs.watch(customerSourceCode, {}, async (event, filename) => {
    console.log(`Source code file: ${filename} changed. Recompiling...`);

    // Configure the output of the compiled code.
    // Turn features on/off.
    const compilationOptions = {
        // Do we want to enable the locker service in the generated output?
        // Nathans idea of allowing this to be toggle is nice in that you can test if your issue is related to Locker
        lockerEnabled: true,

        // Generate minified output?
        // Useful if you want to test what is like production
        minify: false,

        // Generate Compat mode?
        // Useful to test what the IE output would be like.
        compat: false

        // What else would we want to pass?
    };

    // Re-compile the main entry point application.
    // Which is just c-paginator at this point since we only have one component.
    // TEST: Need to test that if the user specifies invalid values to the configs, we report that appropriately.
    lastCompileResult = await compiler.compile(
        configuration.getNamespace(),
        configuration.getEntryPointComponent(),
        compilationOptions
    );

    console.log('last compile result:');
    console.log(lastCompileResult);
    // Write App.js

    // Do Live Reload
    // TODO: Switch to a livereload server.
});

// Create a server to serve the template
const server = http.createServer({}, (req, res) => {
    console.log('Request made: ' + req.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    // Also set these on the response
    // UTF-8, Locale, CSP

    if (lastCompileResult && lastCompileResult.hasError) {
        // Show Error Container to help developer easily solve their problem.
        // Not a fan of passing error to get the error container, should we strongly
        // type it?
        const errorContainer = new LocalDevServerContainer('error');
        errorContainer.writeToResponse(res);
        return;
    }

    // Get the container, specifying the name of the container you want.
    // TEST: Validate invalid value does the right thing here.
    const containerName = configuration.getContainerType() || 'component';
    const container = new LocalDevServerContainer(containerName);
    container.writeToResponse(res);

    res.end('Hello World\n');
});

// Wait for something to happen
server.listen({ port: port, host: hostname }, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
