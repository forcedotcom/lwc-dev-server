module.exports = {
    preset: '@lwc/jest-preset',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '^(localdevserver)/(.+)$': '<rootDir>/modules/$1/$2/$2'
    },
    testMatch: ['**/__tests__/**/?(*.)(spec|test).(js|ts)'],
    resolver: '<rootDir>/lwc-jest-resolver/resolver.js',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/lib/',
        '/dist/',
        '/test-projects/'
    ],
    transformIgnorePatterns: ['.*node_modules/(?!@talon).*'],
    moduleDirectories: ['node_modules'],
    collectCoverage: false,
    coverageReporters: ['json', 'html', 'text'],
    collectCoverageFrom: ['src/**/*.ts', 'src/**/*.js', 'modules/**/*.js'],
    coveragePathIgnorePatterns: ['prismjs.js'],
    coverageDirectory: 'reports/coverage',
    reporters: [
        'default',
        ['jest-junit', { output: './reports/junit/jest-results.xml' }]
    ]
};
