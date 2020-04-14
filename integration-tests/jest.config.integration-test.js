module.exports = {
    displayName: 'Integration Tests',
    testRunner: 'jest-circus/runner',
    preset: 'ts-jest',
    //testMatch: ['<rootDir>/**/*(*.)@(spec|test).[tj]s?(x)'],
    testMatch: ['<rootDir>/**/container-resources.test.ts'],
    testEnvironment: '<rootDir>/environment/DefaultEnvironment.js',
    setupFilesAfterEnv: ['<rootDir>/setup/setupFiles.ts'],
    globalSetup: '<rootDir>/setup/globalSetup.ts',
    globalTeardown: '<rootDir>/setup/globalTeardown.ts',
    testPathIgnorePatterns: ['<rootDir>/src/.+/project/.+/__tests__/'],
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
