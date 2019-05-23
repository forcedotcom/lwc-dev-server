module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['<rootDir>/**/?(*.)test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                output:
                    '<rootDir>/../reports/junit/jest-integration-tests-results.xml'
            }
        ]
    ],
    setupFilesAfterEnv: ['<rootDir>/setup/setupFiles.ts'],
    globalSetup: '<rootDir>/setup/globalSetup.ts',
    globalTeardown: '<rootDir>/setup/globalTeardown.ts'
};
