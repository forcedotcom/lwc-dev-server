import { TelemetryOptions } from '@salesforce/telemetry/lib/telemetryReporter';

export default class LocalDevTelemetryOptions implements TelemetryOptions {
    project = 'lwc-dev-server';
    key = 'f132481a-8211-46a8-9df1-c15d05ac3507';
    contextTags = {
        // Whatever you determine to use as the userid
        'ai.user.id': '',

        // Whatever you decide to use as the session.
        // Which for local dev server would be between starts of the application.
        'ai.session.id': ''
    };

    constructor(userId: string, sessionId: string) {
        this.contextTags['ai.user.id'] = userId;
        this.contextTags['ai.session.id'] = sessionId;
    }
}
