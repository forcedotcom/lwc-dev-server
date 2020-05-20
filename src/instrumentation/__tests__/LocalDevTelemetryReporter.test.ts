import LocalDevTelemetryReporter from '../LocalDevTelemetryReporter';
import * as machineId from '../machineId';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';
import { performance } from 'perf_hooks';

jest.mock('@salesforce/telemetry/lib/telemetryReporter');

/**
 * Mock performance.now call once.
 * @param mockTimeNow Mocked time
 */
function mockNowOnce(mockTimeNow: number) {
    jest.spyOn(performance, 'now').mockImplementationOnce(() => {
        return mockTimeNow;
    });
}

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
        const startTime = 10000;

        mockNowOnce(12345);
        localDevReporter.trackApplicationStart(startTime, true, '23.0');

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start',
            {
                duration: 2345,
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
        const startTime = 10000;

        mockNowOnce(55555);
        localDevReporter.trackApplicationEnd(startTime);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_end',
            {
                runtimeDuration: 45555
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

    test('getInstance() passes userId to TelemetryReporter', async () => {
        TelemetryReporter.create = jest.fn();
        jest.spyOn(machineId, 'getMachineId').mockImplementationOnce(() => {
            return 'userId';
        });
        const localDevReporter = LocalDevTelemetryReporter.getInstance(
            'sessionId'
        );
        // @ts-ignore
        const createMock = TelemetryReporter.create.mock;

        expect(createMock.calls[0][0].contextTags['ai.user.id']).toBe('userId');
    });

    test('getInstance() passes sessionId to TelemetryReporter', async () => {
        TelemetryReporter.create = jest.fn();
        const localDevReporter = LocalDevTelemetryReporter.getInstance(
            'sessionId'
        );
        // @ts-ignore
        const createMock = TelemetryReporter.create.mock;

        expect(createMock.calls[0][0].contextTags['ai.session.id']).toBe(
            'sessionId'
        );
    });
});
