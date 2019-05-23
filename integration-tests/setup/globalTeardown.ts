import { ChildProcess } from 'child_process';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
        }
    }
}

module.exports = async () => {
    global.seleniumProcess.kill();
};
