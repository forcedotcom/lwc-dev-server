import LocalDevTelemetryOptions from '../LocalDevTelemetryOptions';

describe('LocalDevTelemetryOptions', () => {
    test('uses proper project name', () => {
        const options = new LocalDevTelemetryOptions();

        expect(options.project).toBe('lwc-dev-server');
    });

    test('uses local dev server telemetry key', () => {
        const options = new LocalDevTelemetryOptions();

        expect(options.key).toBe('0661613d-a529-4a9c-8309-e4f42d94856d');
    });
});
