import { ChildProcess } from 'child_process';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
            _SFDX_DISABLE_INSIGHTS: string | undefined;
        }
    }
}

module.exports = async () => {
    global.seleniumProcess.kill('SIGINT');
    process.env.SFDX_DISABLE_INSIGHTS = global._SFDX_DISABLE_INSIGHTS;
};
