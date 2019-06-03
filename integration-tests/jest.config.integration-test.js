module.exports = {
    displayName: 'Integration Tests',
    preset: 'ts-jest',
    testMatch: ['<rootDir>/**/?(*.)test.ts'],
    testEnvironment: '<rootDir>/environment/DefaultEnvironment.js',
    setupFilesAfterEnv: ['<rootDir>/setup/setupFiles.ts'],
    globalSetup: '<rootDir>/setup/globalSetup.ts',
    globalTeardown: '<rootDir>/setup/globalTeardown.ts',
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json'
        }
    },
    reporters: [
        'default',
        [
            'jest-junit',
            {
                suiteName: 'Integration Tests',
                output:
                    '<rootDir>/../reports/junit/jest-integration-tests-results.xml'
            }
        ]
    ]
};
