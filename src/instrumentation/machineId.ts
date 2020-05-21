/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See OSSREADME.json in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import crypto from 'crypto';
import os from 'os';

const invalidMacAddresses = new Set([
    '00:00:00:00:00:00',
    'ff:ff:ff:ff:ff:ff',
    'ac:de:48:00:11:22'
]);

/**
 * Returns the first valid mac address of network interfaces.
 * If there're no valid mac addresses returns undefined.
 */
export function getMacAddress() {
    try {
        const networkInterfaces = os.networkInterfaces();
        const macAddresses = Object.keys(networkInterfaces)
            .reduce((macAddresses: string[], networkInterfaceName) => {
                const networkInterfaceInfo =
                    networkInterfaces[networkInterfaceName];
                macAddresses = macAddresses.concat(
                    networkInterfaceInfo.map(info => {
                        return info.mac;
                    })
                );
                return macAddresses;
            }, [])
            .filter(macAddress => {
                return !invalidMacAddresses.has(macAddress);
            });
        if (macAddresses.length > 0) {
            const macAddress = macAddresses[0];
            return macAddress;
        }
    } catch (error) {
        return undefined;
    }
}

/**
 * Create a unique ID that maps to the user that is operating local development.
 * It has no information that you can map back to the actual user.
 * If an error happens while creating the id it defaults to an empty string.
 */
export function getMachineId() {
    const macAddress = getMacAddress();
    return macAddress
        ? crypto
              .createHash('md5')
              .update(macAddress)
              .digest('hex')
        : '';
}
