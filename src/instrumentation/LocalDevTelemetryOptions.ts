import { TelemetryOptions } from '@salesforce/telemetry/lib/telemetryReporter';

export default class LocalDevTelemetryOptions implements TelemetryOptions {
    project = 'lwc-dev-server';
    key = 'f132481a-8211-46a8-9df1-c15d05ac3507';

    constructor() {}
}
