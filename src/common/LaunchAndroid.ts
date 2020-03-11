import * as utils from './AndroidUtils';
import * as reqs from './Requirements';

const DEFAULT_ADB_FORWARDING_PORT = 3333; // needed for refrencing localhost from within android emulators.

export class LaunchAndroid implements reqs.Launcher {
    emulatorName: string;
    device: string;
    target: string;
    emulatorPort: number;

    constructor(
        emulatorName: string,
        device: string,
        target: string,
        emulatorPort: number = 5560
    ) {
        this.emulatorName = emulatorName;
        this.device = device;
        this.target = target;
        this.emulatorPort = emulatorPort;
    }

    public launchNativeBrowser(url: string): void {
        let emName = this.emulatorName;
        let emPort = this.emulatorPort;

        let callbackFunction = function() {
            utils.AndroidSDKUtils.startEmulator(emName, emPort, function() {});

            utils.AndroidSDKUtils.executeWhenDeviceIsReady(emPort, function() {
                utils.AndroidSDKUtils.setLocalHostProxy(
                    emPort,
                    DEFAULT_ADB_FORWARDING_PORT
                );
                utils.AndroidSDKUtils.openURL(url, emPort);
            });
        };

        if (!utils.AndroidSDKUtils.hasEmulator(this.emulatorName)) {
            utils.AndroidSDKUtils.createNewVirtualDevice(
                this.emulatorName,
                this.device,
                this.target,
                callbackFunction
            );
        } else {
            callbackFunction();
        }
    }
}
// let launcher = new LaunchAndroid("LWCEmulator","pixel","android-28");
// launcher.launchNativeBrowser("http://localhost:3333");
