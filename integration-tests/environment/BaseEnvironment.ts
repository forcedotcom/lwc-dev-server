import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import NodeEnvironment from 'jest-environment-node';
import { defaultOutputDirectory } from '../../src/server/LocalDevServer';
import { EnvironmentContext } from '@jest/environment';
import { Config, Circus } from '@jest/types';
import { BrowserObject } from 'webdriverio';

declare global {
    namespace NodeJS {
        interface Global {
            serverPort?: number;
            browser: BrowserObject;
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

    async handleTestEvent(event: Circus.Event, state: Circus.State) {
        // screenshot errors
        if (event.name === 'test_fn_failure') {
            console.log('attempting to save screenshot for test failure');
            const screenshot = await this.global.browser.takeScreenshot();

            let screenshotName = event.test.name;
            let parent: Circus.DescribeBlock | null | undefined =
                event.test.parent;
            while (parent) {
                const parentName = parent.name;
                if (parentName !== 'ROOT_DESCRIBE_BLOCK') {
                    screenshotName = `${parentName} - ${screenshotName}`;
                }
                parent = parent.parent;
            }
            screenshotName = `${screenshotName} - ${new Date().getTime()}.png`;

            const screenshotsPath = path.join(
                __dirname,
                '..',
                '..',
                'errorShots'
            );
            const screenshotPath = path.join(screenshotsPath, screenshotName);

            shell.mkdir('-p', screenshotsPath);
            fs.writeFileSync(screenshotPath, screenshot, 'base64');
            console.log(`screenshot saved at ${screenshotPath}`);
        }
    }
}
