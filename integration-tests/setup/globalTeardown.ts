import { ChildProcess } from 'child_process';

declare global {
    namespace NodeJS {
        interface Global {
            seleniumProcess: ChildProcess;
            _SFDX_DISABLE_TELEMETRY: string | undefined;
        }
    }
}

module.exports = async () => {
    global.seleniumProcess.kill('SIGINT');
    process.env.SFDX_DISABLE_TELEMETRY = global._SFDX_DISABLE_TELEMETRY;
};
