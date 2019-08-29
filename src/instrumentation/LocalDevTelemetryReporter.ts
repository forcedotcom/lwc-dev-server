import LocalDevTelemetryOptions from './LocalDevTelemetryOptions';
import { TelemetryReporter } from '@salesforce/telemetry/lib/telemetryReporter';

export default class LocalDevTelemetryReporter {
    private static _instance: LocalDevTelemetryReporter | null = null;
    private reporter: TelemetryReporter;

    constructor(reporter: TelemetryReporter) {
        this.reporter = reporter;
    }

    public trackApplicationStart(
        duration: number,
        fromVSCode: boolean,
        apiVersion: string
    ) {
        this.reporter.sendTelemetryEvent('application_start', {
            duration,
            fromVSCode: fromVSCode.toString(),
            apiVersion
        });
    }

    public trackApplicationStartException(exception: Error) {
        this.reporter.sendTelemetryEvent('application_start_exception', {
            exception: exception.toString()
        });
    }

    public trackApplicationStartNoAuth() {
        this.reporter.sendTelemetryEvent('application_start_noauth');
    }

    public trackApplicationEnd(runtimeDuration: number) {
        this.reporter.sendTelemetryEvent('application_end', {
            runtimeDuration
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

    public trackComponentPreviewException(
        exception: Error,
        apiVersion: string
    ) {
        this.reporter.sendTelemetryEvent('component_preview_exception', {
            exception: exception.toString(),
            apiVersion
        });
    }

    public trackComponentCompileException(exception: Error) {
        this.reporter.sendTelemetryEvent('component_compile_exception', {
            exception: exception.toString()
        });
    }

    public static async getInstance() {
        if (!this._instance) {
            const reporter = await TelemetryReporter.create(
                new LocalDevTelemetryOptions()
            );
            this._instance = new LocalDevTelemetryReporter(reporter);
        }
        return this._instance;
    }
}
