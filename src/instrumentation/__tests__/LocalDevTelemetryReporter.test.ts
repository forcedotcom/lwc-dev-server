import LocalDevTelemetryReporter from '../LocalDevTelemetryReporter';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';

jest.mock('@salesforce/telemetry/lib/telemetryReporter');

describe('LocalDevTelemetryReporter', () => {
    const MockedReporter = <jest.Mock<TelemetryReporter>>(
        (<unknown>TelemetryReporter)
    );

    // @ts-ignore
    MockedReporter.mockImplementation(() => {
        return {
            sendTelemetryEvent: jest.fn()
        };
    });

    test('trackApplicationStart() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);

        localDevReporter.trackApplicationStart(12345, true, '23.0');

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start',
            {
                duration: 12345,
                fromVSCode: 'true',
                apiVersion: '23.0'
            }
        );
    });

    test('trackApplicationStartException() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);
        const exception = new Error('testing trackApplicationStartException');

        localDevReporter.trackApplicationStartException(exception);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start_exception',
            {
                exception: exception.toString()
            }
        );
    });

    test('trackApplicationStartNoAuth() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);

        localDevReporter.trackApplicationStartNoAuth();

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start_noauth'
        );
    });

    test('trackApplicationEnd() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);

        localDevReporter.trackApplicationEnd(5555);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_end',
            {
                runtimeDuration: 5555
            }
        );
    });

    test('trackComponentPreview() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);

        localDevReporter.trackComponentPreview(
            'containerName',
            1000,
            '44.0',
            'browserName',
            false
        );

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'component_preview',
            {
                container: 'containerName',
                duration: 1000,
                apiVersion: '44.0',
                browser: 'browserName',
                liveReload: 'false'
            }
        );
    });

    test('trackComponentPreviewException() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);
        const exception = new Error('testing trackComponentPreviewException()');

        localDevReporter.trackComponentPreviewException(exception, '45.0');

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'component_preview_exception',
            {
                exception: exception.toString(),
                apiVersion: '45.0'
            }
        );
    });

    test('trackComponentCompileException() sends telemetry event', () => {
        const reporter = new MockedReporter();
        const localDevReporter = new LocalDevTelemetryReporter(reporter);
        const exception = new Error('testing trackComponentCompileException()');

        localDevReporter.trackComponentCompileException(exception);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'component_compile_exception',
            {
                exception: exception.toString()
            }
        );
    });
});
