import childProcess from 'child_process';
import { string } from '@oclif/command/lib/flags';

const execSync = childProcess.execSync;
const execAsync = childProcess.exec;
const spawn = childProcess.spawn;

const ANDROID_HOME = process.env.ANDROID_HOME;
const EMULATOR_COMMAND = ANDROID_HOME + '/emulator/emulator';
const AVDMANAGER_COMMAND = ANDROID_HOME + '/tools/bin/avdmanager';
const ANDROID_LIST_TARGETS_COMMAND = AVDMANAGER_COMMAND + ' list ' + ' target';
const ANDROID_LIST_DEVICES_COMMAND = AVDMANAGER_COMMAND + ' list ' + ' devices';
const ANDROID_LIST_AVDS_COMMAND = AVDMANAGER_COMMAND + ' list ' + ' avd';
const ADB_SHELL_COMMAND = ANDROID_HOME + '/platform-tools/adb';
export const ANDROID_SDK_MANAGER_NAME = 'sdkmanager';
const ANDROID_SDK_MANAGER_CMD =
    ANDROID_HOME + '/tools/bin/' + ANDROID_SDK_MANAGER_NAME;
const ANDROID_SDK_MANAGER_LIST_COMMAND = ANDROID_SDK_MANAGER_CMD + ' --list';

export class AndroidTarget {
    targetId: string;
    targetIdDescription: string;
    name: string;
    type: string;
    apiLevel: number;
    revision: number;

    constructor(
        targetId: string,
        name: string,
        type: string,
        apiLevel: string,
        revision: string
    ) {
        let targetTokens = targetId.split(' ');
        this.targetId = targetTokens[1];
        this.targetIdDescription = targetTokens[3];

        let nameTokens = name.split(':');
        this.name = nameTokens[1].trim();

        let typeTokens = type.split(':');
        this.type = typeTokens[1].trim();

        let apiLevelTokens = apiLevel.split(':');
        this.apiLevel = parseInt(apiLevelTokens[1].trim());

        let revTokens = revision.split(':');
        this.revision = parseInt(revTokens[1].trim());
    }

    static parseRawString(rawString: string): Array<AndroidTarget> {
        let rawStringSplits: Array<string> = rawString.split('\n');

        if (rawStringSplits.length > 0) {
            var i = 0;
            for (i = 0; i < rawStringSplits.length; i++) {
                if (rawStringSplits[i].startsWith('----')) {
                    break; // start of targets
                }
            }
            i = i + 1;
            var targets: Array<AndroidTarget> = new Array();
            for (; i < rawStringSplits.length; i += 6) {
                var target = new AndroidTarget(
                    rawStringSplits[i],
                    rawStringSplits[i + 1],
                    rawStringSplits[i + 2],
                    rawStringSplits[i + 3],
                    rawStringSplits[i + 4]
                );
                targets.push(target);
            }
            return targets;
        }
        return [];
    }
}

export class AndroidDevice {
    targetId: string;
    name: string;
    oem: string;

    constructor(targetId: string, name: string, oem: string) {
        let targetTokens = targetId.split(' ');
        this.targetId = targetTokens[1];

        let nameTokens = name.split(':');
        this.name = nameTokens[1].trim();

        let oemTokens = oem.split(':');
        this.oem = oemTokens[1].trim();
    }

    static parseRawString(rawString: string): Array<AndroidDevice> {
        let rawStringSplits: Array<string> = rawString.split('\n');

        if (rawStringSplits.length > 0) {
            var i = 0;
            for (i = 0; i < rawStringSplits.length; i++) {
                if (rawStringSplits[i].startsWith('id:')) {
                    break; // start of targets
                }
            }
            var devices: Array<AndroidDevice> = new Array();
            while (i < rawStringSplits.length) {
                var device = new AndroidDevice(
                    rawStringSplits[i],
                    rawStringSplits[i + 1],
                    rawStringSplits[i + 2]
                );
                devices.push(device);
                i = i + 3;
                // all fields we may want to ignore. TBD I see tag: in some devices.
                // Are there other attributes that will show?  to protect gains that increment to end of fields marker
                while (
                    rawStringSplits[i] &&
                    !rawStringSplits[i].startsWith('---')
                ) {
                    i++;
                }
                i++; // move past ---
            }
            return devices;
        }
        return [];
    }
}

export class AndroidAVD {
    name: string;
    //  device: string;
    path: string;
    target: string;

    constructor(name: string, device: string, path: string, target: string) {
        let nameTokens = name.split(' ');
        this.name = nameTokens[1];

        let deviceTokens = device.split(':');
        this.name = deviceTokens[1].trim();

        let pathTokens = path.split(':');
        this.path = pathTokens[1].trim();

        let targetTokens = target.split(':');
        this.target = targetTokens[1].trim();
    }

    static parseRawString(rawString: string): Array<AndroidAVD> {
        let rawStringSplits: Array<string> = rawString.split('\n');

        if (rawStringSplits.length > 0) {
            var i = 0;
            for (i = 0; i < rawStringSplits.length; i++) {
                if (rawStringSplits[i].indexOf('Name:') > -1) {
                    break; // start of targets
                }
            }

            var devices: Array<AndroidAVD> = new Array();
            while (i < rawStringSplits.length) {
                var device = new AndroidAVD(
                    rawStringSplits[i],
                    rawStringSplits[i + 1],
                    rawStringSplits[i + 2],
                    rawStringSplits[i + 3]
                );
                devices.push(device);
                i = i + 4;
                // all fields we may want to ignore. TBD I see tag: in some devices.
                // Are there other attributes that will show?  to protect gains that increment to end of fields marker
                while (
                    rawStringSplits[i] &&
                    !rawStringSplits[i].startsWith('---')
                ) {
                    i++;
                }
                i++; // move past ---
            }
            return devices;
        }
        return [];
    }
}

export class AndroidPackage {
    path: string;
    version: string;
    description: string;
    location: string;

    constructor(
        path: string,
        version: string,
        description: string,
        location: string
    ) {
        this.path = path;
        this.version = version;
        this.description = description;
        this.location = location;
    }

    platformAPI(): string {
        let platformApi = '';
        if (
            this.path.startsWith('platforms') ||
            this.path.startsWith('system-images')
        ) {
            let tokens: string[] = this.path.split(';');
            if (tokens.length > 1) {
                return tokens[1];
            }
        }
        return platformApi;
    }

    static parseRawString(rawStringInput: string): Map<string, AndroidPackage> {
        let startIndx = rawStringInput
            .toLowerCase()
            .indexOf('installed packages:', 0);
        let endIndx = rawStringInput
            .toLowerCase()
            .indexOf('available packages:', startIndx);
        let rawString = rawStringInput.substring(startIndx, endIndx);

        let packages: Map<string, AndroidPackage> = new Map();

        //Installed packages:
        let lines = rawString.split('\n');
        if (lines.length > 0) {
            let i = 0;
            for (; i < lines.length; i++) {
                if (lines[i].toLowerCase().indexOf('path') > -1) {
                    i = i + 2; // skip ---- and header
                    break; // start of installed packages
                }
            }

            for (; i < lines.length; i++) {
                let rawStringSplits: Array<string> = lines[i].split('|');
                if (rawStringSplits.length > 1) {
                    let path = rawStringSplits[0].trim();
                    let version = rawStringSplits[1].trim();
                    let description = rawStringSplits[2].trim();
                    let locationOfPack = '';

                    if (rawStringSplits.length > 2) {
                        locationOfPack = rawStringSplits[3].trim();
                    }

                    packages.set(
                        path,
                        new AndroidPackage(
                            path,
                            version,
                            description,
                            locationOfPack
                        )
                    );
                }

                if (lines[i].indexOf('Available Packages:') > -1) {
                    break;
                }
            }
        }
        return packages;
    }
}

export class AndroidSDKUtils {
    static isAndroidHomeSet(): boolean {
        return (
            process.env.ANDROID_HOME != undefined &&
            process.env.ANDROID_HOME.trim().length > 0
        );
    }

    static fetchInstalledPackages(): Map<string, AndroidPackage> {
        if (!AndroidSDKUtils.isAndroidHomeSet()) return new Map();
        try {
            let rawString = execSync(
                ANDROID_SDK_MANAGER_LIST_COMMAND
            ).toString();
            let installedPackages: Map<string, AndroidPackage> = new Map<
                string,
                AndroidPackage
            >();
            if (rawString) {
                installedPackages = AndroidPackage.parseRawString(rawString);
            }
            return installedPackages;
        } catch (err) {
            //console.log(err);
        }
        return new Map();
    }

    static fetchTargets(): Array<AndroidTarget> {
        if (!AndroidSDKUtils.isAndroidHomeSet()) return [];

        try {
            var targetsString = execSync(
                ANDROID_LIST_TARGETS_COMMAND
            ).toString();
            return AndroidTarget.parseRawString(targetsString);
        } catch (err) {
            // console.log(err);
        }
        return [];
    }

    static fetchDevices(): Array<AndroidDevice> {
        if (!AndroidSDKUtils.isAndroidHomeSet()) return [];
        try {
            var targetsString = execSync(
                ANDROID_LIST_DEVICES_COMMAND
            ).toString();
            return AndroidDevice.parseRawString(targetsString);
        } catch (err) {
            //console.log(err);
        }
        return [];
    }

    static fetchEmulators(): Array<AndroidAVD> {
        var targetsString = execSync(ANDROID_LIST_AVDS_COMMAND).toString();
        return AndroidAVD.parseRawString(targetsString);
    }

    static hasEmulator(emulatorName: string): boolean {
        var avdsString = execSync(
            EMULATOR_COMMAND + ' ' + '-list-avds'
        ).toString();
        var listOfAVDs = avdsString
            .split('\n')
            .filter((avd: String) => avd == emulatorName);
        return listOfAVDs && listOfAVDs.length > 0;
    }

    static createNewVirtualDevice(
        emulatorName: string,
        device: string,
        target: string,
        callback: () => void
    ) {
        const child = spawn(
            AVDMANAGER_COMMAND,
            [
                'create',
                'avd',
                '-n',
                emulatorName,
                '--force',
                '-k',
                'system-images;' + target + ';google_apis;x86',
                '--device',
                device,
                '--abi',
                'x86'
            ],
            undefined
        );
        child.stdin.setDefaultEncoding('utf8');
        child.stdin.write('no');
        setTimeout(function() {
            child.stdin.end();
        }, 1000);

        child.stdout.on('close', function(data: any) {
            if (callback) {
                callback();
            }
        });
    }

    static startEmulator(
        emulatorName: string,
        port: number,
        callback: () => void
    ) {
        const child = spawn(
            EMULATOR_COMMAND,
            ['@' + emulatorName, '-port', '' + port],
            {}
        );
        child.stdout.on('data', function(data: any) {
            if (callback) {
                callback();
            }
        });
    }

    static setLocalHostProxy(emulatorPort: number, forwardingPort: number) {
        execSync(
            ADB_SHELL_COMMAND +
                ' -s ' +
                ' emulator-' +
                emulatorPort +
                ' shell settings put global http_proxy localhost:' +
                forwardingPort
        );
        execSync(
            ADB_SHELL_COMMAND +
                ' -s ' +
                ' emulator-' +
                emulatorPort +
                ' reverse tcp:' +
                forwardingPort +
                ' tcp:' +
                forwardingPort
        );
    }

    static openURL(url: string, emulatorPort: number) {
        const child = spawn(
            ADB_SHELL_COMMAND,
            [
                '-s',
                'emulator-' + emulatorPort,
                'shell',
                'am',
                'start',
                '-a',
                'android.intent.action.VIEW',
                '-d',
                url
            ],
            {}
        );
        child.stdout.on('data', function(data: any) {});
    }

    static executeWhenDeviceIsReady(
        emulatorPort: number,
        callback: () => void
    ) {
        let timeout: number = 1000;
        execAsync(
            'adb -s emulator-' +
                emulatorPort +
                ' shell getprop dev.bootcomplete ',
            (err: any, stdout: any, _stderr: any) => {
                if (err) {
                    setTimeout(function() {
                        AndroidSDKUtils.executeWhenDeviceIsReady(
                            emulatorPort,
                            callback
                        );
                    }, timeout);
                    return;
                }
                console.log('Device is ready');
                let result = stdout.toString();
                if (result == 1) {
                    console.log('Device is booted!' + result);
                    callback();
                } else {
                    console.log('Device is not booted!' + result);
                    setTimeout(function() {
                        AndroidSDKUtils.executeWhenDeviceIsReady(
                            emulatorPort,
                            callback
                        );
                    }, timeout);
                }
            }
        );
    }
}
