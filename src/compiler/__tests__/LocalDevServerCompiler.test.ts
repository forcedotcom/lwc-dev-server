/**
 * Test Plan for Local Dev Server Compiler
 *
 * Graceful Error Conditions
 * [ ] - Missing Dependencies cause errors that tell user to run install.
 * [ ] - Compiling code that is not valid produces clear error.
 * [ ] - Specifying an entry point that does not exist gives clear error.
 *
 * Compilation Successfull
 * [ ] - Compiling valid code produces valid output.
 * [ ] - Changing the container type uses different containers.
 * [ ] - Specifying LockerEnabled enables locker
 * [ ] - Specifying minifyEnabled enables minification
 * [ ] - specifying compatEnabled enables compat mode
 * [ ] - Specifying alternate namespace produces code relating to that namespace
 *
 *
 */
describe('Local Dev Server Compiler!', () => {
    describe('Graceful errors', () => {
        it.todo(
            'Missing Dependencies cause errors that tell user to run install.'
        );
        it.todo('Compiling code that is not valid produces clear error');
        it.todo(
            'Specifying an entry point that does not exist gives clear error'
        );
    });
    describe('Compilation Successfull', () => {
        it.todo('Compiling valid code produces valid output');
        it.todo('Changing the container type uses different containers');
        it.todo('Specifying LockerEnabled enables locker');
        it.todo('Specifying minifyEnabled enables minification');
        it.todo('specifying compatEnabled enables compat mode');
        it.todo(
            'Specifying alternate namespace produces code relating to that namespace'
        );
        it.todo('Lots of tests');
    });
});
