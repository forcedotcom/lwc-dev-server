import * as reqs from './Requirements';

const exec = require('child_process').execSync;
const execAsync = require('child_process').exec;

class XCodeUtils {
    static runtimePrefixConstant: string = 'com.apple.CoreSimulator.SimRuntime';

    static fetchAllDevices(): any {
        let listOFDevices: string = exec(
            'xcrun simctl list devices --json'
        ).toString();
        let jsonList = JSON.parse(listOFDevices);
        return jsonList;
    }

    // e.g. runtime match  strings "iOS-13-1","iOS-13-2","watchOS-6-1"
    static fetchAllDevicesThatMatchRuntime(runtimeToMatch: string): [JSON] {
        let listOFRuntimes: any = XCodeUtils.fetchAllDevices();
        let matchedRuntimes: [JSON] =
            listOFRuntimes.devices[
                XCodeUtils.runtimePrefixConstant + '.' + runtimeToMatch
            ];
        //let matchedRuntimes: [JSON] = listOFRuntimes['devices'][XCodeUtils.runtimePrefixConstant + '.' + runtimeToMatch];
        return matchedRuntimes;
    }

    static fetchListOfDevices(): Array<string> {
        let listOFDevices: string = exec(
            "xcrun simctl list devicetypes | grep 'iPhone\\|iPad'"
        ).toString();
        return listOFDevices.split('\n');
    }

    static fetchListOfDevicesThatMatch(word: string): Array<string> {
        let listOFDevices: string = exec(
            'xcrun simctl list devicetypes | grep  "' + word + '"'
        ).toString();
        return listOFDevices.split('\n');
    }

    static fetchListOfBootedDeviceUUIds(): Array<String> {
        let listOFDevices: string = exec(
            'xcrun simctl list devices | grep "(Booted)" | grep -E -o -i "([0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12})"'
        ).toString();
        return listOFDevices.split('\n');
    }

    static fetchListOfIOSRuntimes(): Array<string> {
        let listOFDevices: string = exec(
            "xcrun simctl list runtimes | grep  'iOS'"
        ).toString();
        return listOFDevices.split('\n');
    }

    static createNewDevice(
        simulatorName: string,
        deviceType: string,
        runtime: string
    ): string {
        let uuid: string = exec(
            'xcrun simctl create "' +
                simulatorName +
                '" com.apple.CoreSimulator.SimDeviceType.' +
                deviceType +
                ' com.apple.CoreSimulator.SimRuntime.' +
                runtime
        ).toString();
        // should validate and return an error code if failed
        return uuid;
    }
}

export class LaunchIOS implements reqs.Launcher {
    deviceType: string;
    simulatorName: string;
    runtime: string;
    deviceList: Array<any>;
    currentSimulator: any;

    constructor(simulatorName: string, deviceType: string, runtime: string) {
        this.simulatorName = simulatorName;
        this.deviceType = deviceType;
        this.runtime = runtime;

        this.deviceList = XCodeUtils.fetchAllDevicesThatMatchRuntime(
            this.runtime
        );

        // there could be more than one that matches the name. e.g. if user adds a simulator manually with the same name
        // we will use the firstOne, if none we will create one
        let existingSimulatorList = this.fetchSimulatorIfAlreadyExist();

        if (existingSimulatorList && existingSimulatorList.length < 1) {
            XCodeUtils.createNewDevice(
                this.simulatorName,
                this.deviceType,
                this.runtime
            );
            //refresh the list
            this.deviceList = XCodeUtils.fetchAllDevicesThatMatchRuntime(
                runtime
            ); //refresh entiure list
            //look for our simulator
            existingSimulatorList = this.fetchSimulatorIfAlreadyExist();
            this.currentSimulator = existingSimulatorList[0];
        } else {
            // use the first one in the list.
            this.currentSimulator = existingSimulatorList[0];
        }
        // substitute logger
        if (this.currentSimulator) {
            console.log('iOS Simulator instance found.');
        } else {
            console.log('iOS Simulator could not created.');
        }
    }

    private fetchSimulatorIfAlreadyExist(): Array<any> {
        let filteredList = this.deviceList.filter(
            device => device.name == this.simulatorName
        );
        return filteredList;
    }

    public launchNativeBrowser(url: string): void {
        //WIP: convert these to promises
        execAsync(
            'open -a Simulator',
            (err: Error, stdout: any, stderr: any) => {
                if (err) {
                    console.error(`exec error: ${err}`);
                    return;
                }
                execAsync(
                    'xcrun simctl boot ' +
                        '"' +
                        this.currentSimulator.udid +
                        '"',
                    (err: Error, stdout: any, stderr: any) => {
                        execAsync(
                            'xcrun simctl bootstatus ' +
                                '"' +
                                this.currentSimulator.udid +
                                '"',
                            (err: Error, stdout: any, stderr: any) => {
                                if (err) {
                                    console.error(`exec error: ${err}`);
                                    return;
                                }
                                console.log('Device is Ready ' + stdout);
                                exec(
                                    'xcrun simctl openurl "' +
                                        this.currentSimulator['udid'] +
                                        '"' +
                                        ' ' +
                                        url
                                );
                            }
                        );
                    }
                );
            }
        );
    }
}

// There are lookup functions for these types. Its not exposed.
// Init with a given name, deviceType, runtime, We can perhaps convert these to enums for a small subset?
// simulatorName : Any name example "LWC Simulator"
// e.g. runtime   (com.apple.CoreSimulator.SimRuntime) strings "iOS-13-1","iOS-13-2","watchOS-6-1"
// e.g. deviceType (com.apple.CoreSimulator.SimDeviceType)   strings "iPhone-X","iPad-Pro--10-5-inch-","watchOS-6-1" ,"Apple-Watch-42mm"
// let launcher = new LaunchIOS("LWC SIM", "iPhone-X","iOS-13-3")
// launcher.launchNativeBrowser("http://localhost:3333/")
