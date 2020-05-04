import { WebruntimeAppDefinition, WebruntimePage } from '@webruntime/api';
import { getWebAppVersionKey } from '../../common/versionUtils';

/**
 * Returns JavaScript code that will add a module with the given name and
 * constant value to the registry.
 *
 * This is meant to be injected in the HTML to define `@app/*` modules.
 */
function define([key, value]: [string, any]) {
    return `Webruntime.define('${key}', [], function() { return ${JSON.stringify(
        value
    )}; })`;
}

export class LocalDevPage extends WebruntimePage {
    get experimental_content() {
        const { sessionNonce }: any = this.pageContext.locals;
        const { basePath } = this.pageContext.config.server;

        // calculate our own version key until LWR provides one
        const versionKey = getWebAppVersionKey();

        // Matches of {key} or { key } in the template will get replaced with
        // values from this map.
        const substitutions: { [key: string]: string } = {
            sessionNonce,
            basePath,
            versionKey
        };

        // Replace template variables with properties from the
        // subitutions map above.
        return this.pageContext.templateContent.replace(
            /{\s*([^{}]+)\s*}/g,
            (originalValue: string, key: string) => {
                return substitutions.hasOwnProperty(key)
                    ? substitutions[key]
                    : originalValue;
            }
        );
    }

    get experimental_scripts() {
        const { request: req }: any = this.pageContext;
        const { basePath } = this.pageContext.config.server;

        const modules = {
            '@app/basePath': basePath,
            '@app/csrfToken': req.csrfToken && req.csrfToken()
        };

        const defineModulesScript = Object.entries(modules)
            .map(define)
            .join('\n');

        return [
            {
                code: defineModulesScript
            }
        ];
    }
}

export class LocalDevApp extends WebruntimeAppDefinition {
    get pages() {
        return [
            {
                route: '/*',
                page: LocalDevPage
            }
        ];
    }
}
