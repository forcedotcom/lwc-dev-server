import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import NodeEnvironment from 'jest-environment-node';
import { defaultOutputDirectory } from '../../dist/server/LocalDevServer';
import { EnvironmentContext } from '@jest/environment';
import { Config } from '@jest/types';

declare global {
    namespace NodeJS {
        interface Global {
            serverPort?: number;
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
        const outputDir = path.join(this.projectPath, defaultOutputDirectory);
        shell.rm('-rf', outputDir);
    }
}
