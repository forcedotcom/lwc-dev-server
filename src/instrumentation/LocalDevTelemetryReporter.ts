import LocalDevTelemetryOptions from './LocalDevTelemetryOptions';
import { getMachineId } from './machineId';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';
import { performance } from 'perf_hooks';

export default class LocalDevTelemetryReporter {
    private static _instance: LocalDevTelemetryReporter | null = null;
    private reporter: TelemetryReporter;

    constructor(reporter: TelemetryReporter) {
        this.reporter = reporter;
    }

    /**
     * Send telemetry of server start up duration
     * @param startTime High resolution millisecond timestamp of server start time
     * @param apiVersion API Version
     */
    public trackApplicationStart(startTime: number, apiVersion: string) {
        this.reporter.sendTelemetryEvent('application_start', {
            duration: performance.now() - startTime,
            tool: process.env.SFDX_TOOL,
            apiVersion
        });
    }

    /**
     * Send telemetry when there's an exception during server start
     * @param exception exception
     */
    public trackApplicationStartException(exception: Error) {
        this.reporter.sendTelemetryEvent('application_start_exception', {
            exception: exception.toString()
        });
    }

    /**
     * Send telemetry when there's an error during server start
     * @param error error
     */
    public trackApplicationStartError(error: string) {
        this.reporter.sendTelemetryEvent('application_start_exception', {
            exception: error
        });
    }

    public trackApplicationStartNoAuth() {
        this.reporter.sendTelemetryEvent('application_start_noauth');
    }

    /**
     * Send telemetry of server run time duration
     * @param startTime High resolution millisecond timestamp of server start time
     */
    public trackApplicationEnd(startTime: number) {
        this.reporter.sendTelemetryEvent('application_end', {
            runtimeDuration: performance.now() - startTime
        });
    }

    public trackComponentPreview(
        container: string,
        duration: number,
        apiVersion: string,
        browser: string,
        liveReload: boolean
    ) {
        this.reporter.sendTelemetryEvent('component_preview', {
            container,
            duration,
            apiVersion,
            browser,
            liveReload: liveReload.toString()
        });
    }

    public trackComponentPreviewException(exception: Error) {
        this.reporter.sendTelemetryEvent('component_preview_exception', {
            exception: exception.toString()
        });
    }

    public trackComponentCompileException(exception: Error) {
        this.reporter.sendTelemetryEvent('component_compile_exception', {
            exception: exception.toString()
        });
    }

    public trackNonSfdxProjectUsage() {
        this.reporter.sendTelemetryEvent('application_start_non_sfdx_project');
    }

    public trackMissingDependentComponent() {
        this.reporter.sendTelemetryEvent('missing_dependent_component');
    }

    public static async getInstance(sessionId: string) {
        const userId = getMachineId();
        const reporter = await TelemetryReporter.create(
            new LocalDevTelemetryOptions(userId, sessionId)
        );
        return new LocalDevTelemetryReporter(reporter);
    }
}
