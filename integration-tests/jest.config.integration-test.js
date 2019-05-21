module.exports = {
    preset: '@lwc/jest-preset',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['<rootDir>/**/?(*.)(spec|test).(js|ts)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/lib/',
        '/dist/',
        '/test-projects/'
    ],
    collectCoverage: true,
    coverageReporters: ['json', 'html', 'text'],
    collectCoverageFrom: ['src/**/*.ts', 'src/**/*.js', 'modules/**/*.js'],
    coveragePathIgnorePatterns: ['prismjs.js'],
    coverageDirectory: 'reports/coverage',
    reporters: [
        'default',
        ['jest-junit', { output: './reports/junit/jest-results.xml' }]
    ],
    setupFilesAfterEnv: ['<rootDir>/setup.ts']
};
