#!/usr/bin/env ts-node

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { CommandLineUtils } from '../../../../../common/Common';
import {
    RequirementList,
    SetupTestResult
} from '../../../../../common/Requirements';
import { AndroidEnvironmentSetup } from '../../../../../common/AndroidEnvironmentSetup';
import { IOSEnvironmentSetup } from '../../../../../common/IOSEnvironmentSetup';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/lwc-dev-server', 'preview');

export default class Setup extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lightning:lwc:setup -p iOS`,
        `$ sfdx force:lightning:lwc:setup -p Android`
    ];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        platform: flags.string({
            char: 'p',
            description: messages.getMessage('platformFlagDescription')
        })
    };

    public async run(): Promise<SetupTestResult> {
        let setup: RequirementList;
        //let setupResult: SetupTestResult = new  SetupTestResult();

        if (this.flags.platform === undefined) {
            return new Promise((resolve, reject) => {
                reject({ hasMetAllRequirements: false, tests: [] });
            });
        }

        if (CommandLineUtils.platformFlagIsIOS(this.flags.platform)) {
            setup = new IOSEnvironmentSetup();
        } else {
            setup = new AndroidEnvironmentSetup();
        }
        return setup.executeSetup();
    }
}
