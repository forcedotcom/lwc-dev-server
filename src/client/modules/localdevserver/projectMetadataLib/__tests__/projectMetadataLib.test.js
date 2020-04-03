import * as lib from '../projectMetadataLib';
import { mockComponentMetadata } from '../../../__tests__/testutils';

function createProjectMetadata() {
    return {
        project: {
            projectName: 'test-project',
            packages: [
                {
                    packageName: 'Test Package',
                    isDefault: true,
                    key: 'package1',
                    components: [
                        mockComponentMetadata('c', 'foo'),
                        mockComponentMetadata('c', 'fooBar'),
                        mockComponentMetadata('c', 'fooBaz')
                    ]
                }
            ]
        }
    };
}

describe('localdevserver-project-metadata-lib', () => {
    describe('getNonce', () => {
        afterEach(() => {
            document.head.innerHTML = '';
        });

        it('should return the nonce from the meta tag', () => {
            document.head.innerHTML = '<meta name="nonce" content="secret">';

            expect(lib.getNonce()).toEqual('secret');
        });

        it('should return empty string when the meta tag does not exist', () => {
            expect(lib.getNonce()).toEqual('');
        });
    });

    describe('getProjectMetadata', () => {
        afterEach(() => {
            window.LocalDev = null;
        });

        it('resolves data from window.LocalDev', async () => {
            const metadata = createProjectMetadata();
            window.LocalDev = metadata;

            const result = await lib.getProjectMetadata();
            expect(result).toBe(metadata.project);
        });

        it('rejects the promise when window.LocalDev is not set', async () => {
            expect(lib.getProjectMetadata()).rejects.toEqual(
                new Error('project metadata not set on the window')
            );
        });
    });

    describe('getComponentMetadata', () => {
        afterEach(() => {
            window.LocalDev = null;
        });

        it('finds the metadata from the default package', async () => {
            const cmp1 = mockComponentMetadata('c', 'foo');
            const cmp2 = mockComponentMetadata('c', 'foo2');

            window.LocalDev = {
                project: {
                    projectName: 'test-project',
                    packages: [
                        {
                            packageName: 'Test Package',
                            isDefault: true,
                            key: 'package1',
                            components: [cmp1]
                        },
                        {
                            packageName: 'Test Package2',
                            key: 'package2',
                            components: [cmp2]
                        }
                    ]
                }
            };

            const result = await lib.getComponentMetadata('c/foo');
            expect(result).toBe(cmp1);
        });

        it('finds the metadata from the specifed package', async () => {
            const cmp1 = mockComponentMetadata('c', 'foo');
            const cmp2 = mockComponentMetadata('c', 'foo2');

            window.LocalDev = {
                project: {
                    projectName: 'test-project',
                    packages: [
                        {
                            packageName: 'Test Package',
                            isDefault: true,
                            key: 'package1',
                            components: [cmp1]
                        },
                        {
                            packageName: 'Test Package2',
                            key: 'package2',
                            components: [cmp2]
                        }
                    ]
                }
            };

            const result = await lib.getComponentMetadata('c/foo2', 'package2');
            expect(result).toBe(cmp2);
        });

        it('rejects when component name is not found', async () => {
            window.LocalDev = createProjectMetadata();

            expect(lib.getComponentMetadata('c/xxx')).rejects.toEqual(
                new Error(
                    "Unable to find component 'c/xxx' in the project metadata"
                )
            );
        });

        it('rejects when the specified package doesnt exist', async () => {
            window.LocalDev = createProjectMetadata();

            expect(lib.getComponentMetadata('c/xxx', 'xxx')).rejects.toEqual(
                new Error(
                    "Unable to find package 'xxx' in the project metadata"
                )
            );
        });
    });
});
