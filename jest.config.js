module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    coverageReporters: ['json', 'html', 'text'],
    collectCoverageFrom: ['src/**/*.ts', 'src/**/*.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/test-projects/'],
    coverageDirectory: 'reports/coverage',
    reporters: [
        'default',
        [
            'jest-junit',
            { outputDirectory: './reports/tests', suiteName: 'Jest tests' }
        ]
    ]
};
