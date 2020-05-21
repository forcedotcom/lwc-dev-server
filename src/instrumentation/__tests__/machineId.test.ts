import { getMacAddress, getMachineId } from '../machineId';
import crypto from 'crypto';
import os from 'os';

/**
 * Mock os.networkInterfaces() once
 * @param networkInterfaces mocked network interfaces
 */
function mockNetworkInterfacesOnce(networkInterfaces: {
    [index: string]: os.NetworkInterfaceInfo[];
}) {
    jest.spyOn(os, 'networkInterfaces').mockReturnValueOnce(networkInterfaces);
}

describe('machineId', () => {
    describe('getMacAddress', () => {
        it('should return valid mac address (macOS)', () => {
            mockNetworkInterfacesOnce({
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'ab:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const macAddress = getMacAddress();
            expect(macAddress).toEqual('ab:00:11:22:33:44');
        });

        it('should return valid mac address (Windows)', () => {
            mockNetworkInterfacesOnce({
                'Wi-Fi': [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: '44:33:22:11:00:ab',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 0
                    }
                ]
            });
            const macAddress = getMacAddress();
            expect(macAddress).toEqual('44:33:22:11:00:ab');
        });

        it('should return filter invalid mac address', () => {
            mockNetworkInterfacesOnce({
                lo0: [
                    {
                        address: '127.0.0.1',
                        netmask: '255.0.0.0',
                        family: 'IPv4',
                        mac: '00:00:00:00:00:00',
                        internal: true,
                        cidr: '127.0.0.1/8'
                    }
                ],
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'ab:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const macAddress = getMacAddress();
            expect(macAddress).toEqual('ab:00:11:22:33:44');
        });

        it('if no mac address is found should return undefined', () => {
            mockNetworkInterfacesOnce({});
            const macAddress = getMacAddress();
            expect(macAddress).toBeUndefined();
        });

        it('if no mac address is found should return undefined', () => {
            jest.spyOn(os, 'networkInterfaces').mockImplementationOnce(() => {
                throw new Error('test');
            });
            const macAddress = getMacAddress();
            expect(macAddress).toBeUndefined();
        });
    });

    describe('getMachineId', () => {
        it('should encrypt mac address', () => {
            // @ts-ignore
            const hash: crypto.Hash = {
                update: (data: string) => {
                    return hash;
                },
                // @ts-ignore
                digest: function() {
                    return 'anonymousUserId';
                }
            };
            jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => {
                return hash;
            });
            const machineId = getMachineId();
            expect(machineId).toEqual('anonymousUserId');
        });

        it('same mac address should yield same machine id', () => {
            mockNetworkInterfacesOnce({
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'ab:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const machineId1 = getMachineId();
            mockNetworkInterfacesOnce({
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'ab:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const machineId2 = getMachineId();
            expect(machineId1).toEqual(machineId2);
        });

        it('different mac address should yield different machine id', () => {
            mockNetworkInterfacesOnce({
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'ab:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const machineId1 = getMachineId();
            mockNetworkInterfacesOnce({
                en0: [
                    {
                        address: '0000::0000:0000:0000:0000',
                        netmask: 'ffff:ffff:ffff:ffff::',
                        family: 'IPv6',
                        mac: 'cd:00:11:22:33:44',
                        internal: false,
                        cidr: '0000::0000:0000:0000:0000/64',
                        scopeid: 6
                    }
                ]
            });
            const machineId2 = getMachineId();
            expect(machineId1).not.toEqual(machineId2);
        });
    });
});
