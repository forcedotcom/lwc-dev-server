import LocalDevTelemetryOptions from './LocalDevTelemetryOptions';
import { getMachineId } from './machineId';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';
import { performance } from 'perf_hooks';

export default class LocalDevTelemetryReporter {
    private static _instance: LocalDevTelemetryReporter;
    private reporter: TelemetryReporter | undefined;

    /**
     * Send telemetry of server start up duration
     * @param startTime High resolution millisecond timestamp of server start time
     * @param apiVersion API Version
     */
    public trackApplicationStart(startTime: number, apiVersion: string) {
        if (this.reporter !== undefined) {
            this.reporter.sendTelemetryEvent('application_start', {
                duration: performance.now() - startTime,
                tool: process.env.SFDX_TOOL,
                apiVersion
            });
        }
    }

    /**
     * Send telemetry when there's an exception during server start
     * @param exception exception
     */
    public trackApplicationStartException(exception: Error) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('application_start_exception', {
                exception: exception.toString()
            });
        }
    }

    /**
     * Send telemetry when there's an error during server start
     * @param error error
     */
    public trackApplicationStartError(error: string) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('application_start_exception', {
                exception: error
            });
        }
    }

    public trackApplicationStartNoAuth() {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('application_start_noauth');
        }
    }

    /**
     * Send telemetry of server run time duration
     * @param startTime High resolution millisecond timestamp of server start time
     */
    public trackApplicationEnd(startTime: number) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('application_end', {
                runtimeDuration: performance.now() - startTime
            });
        }
    }

    public trackComponentPreview(
        container: string,
        duration: number,
        apiVersion: string,
        browser: string,
        liveReload: boolean
    ) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('component_preview', {
                container,
                duration,
                apiVersion,
                browser,
                liveReload: liveReload.toString()
            });
        }
    }

    public trackComponentPreviewException(
        exception: Error,
        apiVersion: string
    ) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('component_preview_exception', {
                exception: exception.toString(),
                apiVersion
            });
        }
    }

    public trackComponentCompileException(exception: Error) {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('component_compile_exception', {
                exception: exception.toString()
            });
        }
    }

    public trackMissingDependentComponent() {
        if (this.reporter) {
            this.reporter.sendTelemetryEvent('missing_dependent_component');
        }
    }

    public static getInstance() {
        if (!LocalDevTelemetryReporter._instance) {
            LocalDevTelemetryReporter._instance = new LocalDevTelemetryReporter();
        }
        return LocalDevTelemetryReporter._instance;
    }

    public async initializeService(sessionNonce: string) {
        const userId = getMachineId();
        this.reporter = await TelemetryReporter.create(
            new LocalDevTelemetryOptions(userId, sessionNonce)
        );
    }

    public setReporter(reporter: TelemetryReporter) {
        this.reporter = reporter;
    }
}
