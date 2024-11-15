import LocalDevTelemetryReporter from '../LocalDevTelemetryReporter';
import * as machineId from '../machineId';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';
import { performance } from 'perf_hooks';
import LocalDevTelemetryOptions from '../LocalDevTelemetryOptions';
import { mock } from 'ts-mockito';

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
    const MockedReporter = {
        sendTelemetryEvent: jest.fn()
    };
    let reporter: TelemetryReporter;
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.spyOn(TelemetryReporter, 'create').mockImplementation(
            // @ts-ignore
            async () => MockedReporter
        );
        reporter = await TelemetryReporter.create(
            mock(LocalDevTelemetryOptions)
        );
        jest.spyOn(reporter, 'sendTelemetryEvent');
    });

    test('trackApplicationStart() sends telemetry event with duration and api version', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
        const startTime = 10000;
        const apiVersion = '23.0';

        mockNowOnce(12345);
        localDevReporter.trackApplicationStart(startTime, apiVersion);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start',
            {
                duration: 2345,
                apiVersion: '23.0'
            }
        );
    });

    test('trackApplicationStart() sends telemetry event and event has correct tool field if SFDX_TOOL env variable is set', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
        localDevReporter.initializeService('sessionId');
        const startTime = 10000;
        const apiVersion = '23.0';

        mockNowOnce(12345);
        // mock SFDX_TOOL env variable
        const originalEnvSfdxTool = process.env.SFDX_TOOL;
        process.env.SFDX_TOOL = 'salesforce-vscode-extensions';
        localDevReporter.trackApplicationStart(startTime, apiVersion);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start',
            {
                duration: 2345,
                tool: 'salesforce-vscode-extensions',
                apiVersion: '23.0'
            }
        );

        // unmock SFDX_TOOL env variable
        if (typeof originalEnvSfdxTool !== 'undefined') {
            process.env.SFDX_TOOL = originalEnvSfdxTool;
        } else {
            delete process.env.SFDX_TOOL;
        }
    });

    test('trackApplicationStart() sends telemetry event and event does not have tool field if SFDX_TOOL env variable is not set', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
        localDevReporter.initializeService('sessionId');
        const startTime = 10000;
        const apiVersion = '23.0';

        localDevReporter.trackApplicationStart(startTime, apiVersion);

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start',
            expect.not.objectContaining({ tool: expect.anything() })
        );
    });

    test('trackApplicationStartException() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
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

    test('trackApplicationStartNoAuth() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);

        localDevReporter.trackApplicationStartNoAuth();

        expect(reporter.sendTelemetryEvent).toHaveBeenCalledTimes(1);
        expect(reporter.sendTelemetryEvent).toHaveBeenCalledWith(
            'application_start_noauth'
        );
    });

    test('trackApplicationEnd() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
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

    test('trackComponentPreview() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);

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

    test('trackComponentPreviewException() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
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

    test('trackComponentCompileException() sends telemetry event', async () => {
        const localDevReporter = new LocalDevTelemetryReporter();
        localDevReporter.setReporter(reporter);
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
        const localDevReporter = LocalDevTelemetryReporter.getInstance().initializeService(
            'sessionId'
        );
        // @ts-ignore
        const createMock = TelemetryReporter.create.mock;

        expect(createMock.calls[0][0].contextTags['ai.user.id']).toBe('userId');
    });

    test('getInstance() passes sessionId to TelemetryReporter', async () => {
        TelemetryReporter.create = jest.fn();
        const localDevReporter = LocalDevTelemetryReporter.getInstance().initializeService(
            'sessionId'
        );
        // @ts-ignore
        const createMock = TelemetryReporter.create.mock;

        expect(createMock.calls[0][0].contextTags['ai.session.id']).toBe(
            'sessionId'
        );
    });
});
