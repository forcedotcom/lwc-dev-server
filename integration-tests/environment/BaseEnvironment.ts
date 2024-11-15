import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import NodeEnvironment from 'jest-environment-node';
import { EnvironmentContext } from '@jest/environment';
import { Config, Circus } from '@jest/types';
import { BrowserObject } from 'webdriverio';

declare global {
    namespace NodeJS {
        interface Global {
            serverPort?: number;
            browser: BrowserObject;
            failedTest?: Circus.TestEntry;
        }
    }
}

export default class BaseEnvironment extends NodeEnvironment {
    readonly projectPath: string;

    constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
        super(config);

        // ensure we have a test project that exists
        if (!context.testPath) {
            throw new Error('unable to determine test path');
        }
        const testDirPath = path.dirname(context.testPath);

        let projectPath = 'project';
        if (context.docblockPragmas && context.docblockPragmas['project']) {
            const projectValue = context.docblockPragmas['project'];
            if (Array.isArray(projectValue)) {
                throw new Error('value for @project must be a single string');
            } else {
                projectPath = projectValue;
            }
        }
        this.projectPath = path.resolve(testDirPath, projectPath);

        if (!fs.existsSync(this.projectPath)) {
            throw new Error(`missing test project '${this.projectPath}'`);
        }

        // remove outputDirectory in project if it's there...
        const outputDir = path.join(this.projectPath, '.localdevserver');
        shell.rm('-rf', outputDir);
    }

    async handleTestEvent(event: Circus.Event, state: Circus.State) {
        if (event.name === 'test_fn_failure') {
            this.global.failedTest = event.test;
        }
    }
}
