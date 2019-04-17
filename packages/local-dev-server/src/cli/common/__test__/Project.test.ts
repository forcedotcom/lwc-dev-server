import Project from '../Project';

describe('project', () => {
    describe('getDirectory()', () => {
        it('getDirectory resolves current working directory', () => {
            const project = new Project('.');
            expect(project.getDirectory()).toEqual(process.cwd());
        });
    });

    describe('isSfdx()', () => {
        it('local-dev-server is not an sfdx project', () => {
            const project = new Project('.');
            expect(project.isSfdx()).toBeFalsy();
        });
    });
});
