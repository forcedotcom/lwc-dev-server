import { TelemetryOptions } from '@salesforce/telemetry/lib/telemetryReporter';

export default class LocalDevTelemetryOptions implements TelemetryOptions {
    project = 'local-dev-server';
    key = '0661613d-a529-4a9c-8309-e4f42d94856d';

    constructor() {}
}
