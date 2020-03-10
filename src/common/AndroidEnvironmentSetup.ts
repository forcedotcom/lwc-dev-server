import * as config from './Config';
import * as reqs from './Requirements';
import * as utils from './AndroidUtils';
import { MapUtils } from './Common';
import shell from 'shelljs';

export class AndroidEnvironmentSetup extends reqs.BaseSetup {
    constructor() {
        super();
        super.requirements = [
            {
                title: 'SDK Check',
                checkFunction: this.isAndroidSDKInstalled,
                fulfilledMessage: 'Android SDK was detected.',
                unfulfilledMessage:
                    'You must install Android SDK add it to the path.'
            },
            {
                title: 'ANDROID_HOME check',
                checkFunction: this.hasSetAndroidHome,
                fulfilledMessage: 'ANDROID_HOME has been detected.',
                unfulfilledMessage: 'You must setup ANDROID_HOME.'
            },
            {
                title: 'API Compatibility check',
                checkFunction: this.hasSupportedAPI,
                fulfilledMessage:
                    'A supported version of Android SDK API detected.',
                unfulfilledMessage:
                    'A minimum of version Android SDK must be 23'
            },
            {
                title: 'Build Tools check',
                checkFunction: this.hasSupportedBuildTools,
                fulfilledMessage:
                    'A supported version of Android SDK API detected.',
                unfulfilledMessage:
                    'A minimum of version Android Tools must be 23'
            },
            {
                title: 'Emulator system images check',
                checkFunction: this.hasSupportedImages,
                fulfilledMessage:
                    'Supported system image for emulator detected.',
                unfulfilledMessage:
                    'No compatible system images for emulator found.'
            }
        ];
    }

    async isAndroidSDKInstalled(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let sdkManagerPath = shell.which(utils.ANDROID_SDK_MANAGER_NAME);
            if (sdkManagerPath) {
                resolve('Android SDK detected.');
            } else {
                reject(new Error('Android SDK was not detected.'));
            }
        });
    }

    async hasSetAndroidHome(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (utils.AndroidSDKUtils.isAndroidHomeSet()) {
                resolve('ANDROID_HOME detected.');
            } else {
                reject(new Error('ANDROID_HOME was not detected.'));
            }
        });
    }

    async hasSupportedAPI(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let androidConfig = config.DefaultLWCMobileConfig.android;
            let packages = utils.AndroidSDKUtils.fetchInstalledPackages();
            if (packages == null) {
                reject(
                    new Error(
                        'Android SDK required API was not detected. Set ANDROID_HOME'
                    )
                );
                return;
            }
            // find supported platforms
            if (packages.size > 0) {
                for (let runtime of androidConfig.supportedRuntimes) {
                    let currPack = packages.get('platforms;' + runtime);
                    if (currPack) {
                        resolve(
                            'Android SDK ' +
                                currPack.platformAPI() +
                                ' detected.'
                        );
                        return;
                    }
                }
            }
            reject(new Error('Android SDK required API was not detected.'));
        });
    }

    async hasSupportedBuildTools(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let androidConfig = config.DefaultLWCMobileConfig.android;
            let packages: Map<
                String,
                utils.AndroidPackage
            > = utils.AndroidSDKUtils.fetchInstalledPackages();
            if (packages == null) {
                reject(
                    new Error(
                        'Android SDK could not find installed pacakges for build tools. Set ANDROID_HOME'
                    )
                );
                return;
            }
            let buildToolPackages: Map<
                String,
                utils.AndroidPackage
            > = MapUtils.filter(
                packages,
                (key, value) => key.indexOf('build-tools;') > -1
            );
            // find supported platforms
            if (buildToolPackages.size > 0) {
                for (let [key, value] of Array.from(
                    buildToolPackages.entries()
                )) {
                    for (let pattern of androidConfig.supportedBuildTools) {
                        if (key.indexOf('build-tools;' + pattern) > -1) {
                            resolve(
                                'Android Build tools ' +
                                    value.path +
                                    ' detected.'
                            );
                            return;
                        }
                    }
                }
            }
            reject(
                new Error('Android SDK required Build tools was not detected.')
            );
        });
    }

    async hasSupportedImages(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let androidConfig = config.DefaultLWCMobileConfig.android;
            let packages: Map<
                String,
                utils.AndroidPackage
            > = utils.AndroidSDKUtils.fetchInstalledPackages();
            let preferedAndroidPlatformPackage:
                | utils.AndroidPackage
                | undefined;
            if (packages == null) {
                reject(
                    new Error(
                        'Android SDK required API was not detected. Set ANDROID_HOME'
                    )
                );
                return;
            }
            // find supported platforms
            if (packages.size > 0) {
                for (let runtime of androidConfig.supportedRuntimes) {
                    let currPack = packages.get('platforms;' + runtime);
                    if (currPack) {
                        preferedAndroidPlatformPackage = currPack;
                        break;
                    }
                }
            }

            if (
                preferedAndroidPlatformPackage == null ||
                preferedAndroidPlatformPackage == undefined
            ) {
                reject(
                    new Error(
                        'Could not find a system image, install a valid sdk.'
                    )
                );
                return;
            }

            let platformAPI = preferedAndroidPlatformPackage.platformAPI();
            if (packages == null) {
                reject(
                    new Error(
                        'Android SDK could not find installed pacakges for system images. Setup Android_HOME and install supported system images for api level ' +
                            platformAPI
                    )
                );
                return;
            }

            let systemPackages: Map<
                String,
                utils.AndroidPackage
            > = MapUtils.filter(
                packages,
                (key, value) =>
                    key.indexOf('system-images;') > -1 &&
                    key.indexOf(platformAPI) > -1
            );
            if (systemPackages != null && systemPackages.size > 0) {
                for (let [key, systemPackage] of Array.from(
                    systemPackages.entries()
                )) {
                    for (let image of config.DefaultLWCMobileConfig.android
                        .supportedImages) {
                        if (systemPackage.path.indexOf(image) > -1) {
                            resolve(
                                'Android SDK Emulator images (' +
                                    image +
                                    ') for ' +
                                    platformAPI +
                                    ' found.'
                            );
                            return;
                        }
                    }
                }
            }
            reject(
                new Error('System image for api ' + platformAPI + ' missing.')
            );
        });
    }
}

//test!
// let envSetup = new AndroidEnvironmentSetup();
// envSetup.executeSetup();
