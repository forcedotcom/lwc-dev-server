#!/usr/bin/env ts-node
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { CommandLineUtils } from '../../../../../common/Common';
import { Launcher } from '../../../../../common/Requirements';
import { LaunchIOS } from '../../../../../common/LaunchIOS';
import { LaunchAndroid } from '../../../../../common/LaunchAndroid';
import { DefaultLWCMobileConfig } from '../../../../../common/Config';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/lwc-dev-server', 'preview');

export default class Preview extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:lightning:lwc:preview -p iOS -t LWCSim2 -f http://localhost:3333`,
        `$ sfdx force:lightning:lwc:preview -p Android -t LWCEmu2 -f http://localhost:3333`
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        platform: flags.string({
            char: 'p',
            description: messages.getMessage('platformFlagDescription')
        }),
        path: flags.string({
            char: 'f',
            description: messages.getMessage('pathFlagDescription')
        }),
        target: flags.string({
            char: 't',
            description: messages.getMessage('targetFlagDescription')
        })
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = false;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = false;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = false;

    public async run(): Promise<any> {
        let launcher: Launcher;
        let url: string = '';

        if (this.flags.platform === undefined) {
            return new Promise<any>((resolve, reject) => reject(false));
        }
        //FIXME: Invoke setup and use detected settings!
        if (CommandLineUtils.platformFlagIsIOS(this.flags.platform)) {
            launcher = new LaunchIOS(this.flags.target, 'iPhone-X', 'iOS-13-3');
            url = this.flags.path;
        } else if (
            CommandLineUtils.platformFlagIsAndroid(this.flags.platform)
        ) {
            launcher = new LaunchAndroid(
                this.flags.target,
                'pixel',
                'android-28'
            );
            url = this.flags.path;
        }

        // if (this.flags.platform.toLowerCase() == "ios") {
        //   launcher = new LaunchIOS(this.flags.target, "iPhone-X","iOS-13-3");
        //   url = this.flags.path;
        // } else if (this.flags.platform.toLowerCase() == "android") {
        //   launcher = new LaunchAndroid(this.flags.target,"pixel","android-28");
        //   url = this.flags.path;
        // }
        // return launcher.launchNativeBrowser(url);
        return new Promise<any>((resolve, reject) => {
            if (launcher == null) {
                reject('Could not launch target');
                return;
            }
            resolve(launcher.launchNativeBrowser(url));
        });
    }
}
