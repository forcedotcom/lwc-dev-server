import LocalDevTelemetryOptions from '../LocalDevTelemetryOptions';

describe('LocalDevTelemetryOptions', () => {
    test('uses proper project name', () => {
        const options = new LocalDevTelemetryOptions();

        expect(options.project).toBe('lwc-dev-server');
    });

    test('uses local dev server telemetry key', () => {
        const options = new LocalDevTelemetryOptions();

        expect(options.key).toBe('f132481a-8211-46a8-9df1-c15d05ac3507');
    });
});
