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

    describe('getModuleSourceDirectory()', () => {
        it.todo('getModuleSourceDirectory resolves to correct location');

        it.todo('getModuleSourceDirectory resolves sfdx directories');

        it('getModuleSourceDirectory returns empty string for module less projects', () => {
            const project = new Project('.');
            //expect(project.getModuleSourceDirectory()).toBe('');
        });
    });
});
