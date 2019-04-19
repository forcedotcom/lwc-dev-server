module.exports = {
    transformIgnorePatterns: [
        '<rootDir>.*(node_modules)(?!.*local-dev-tools.*).*$'
    ],
    projects: ['<rootDir>/packages/local-dev-server/jest.config.js']
};
