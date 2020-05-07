import fs from 'fs';
import path from 'path';
import debugLogger from 'debug';
import { WebruntimeAppDefinition, WebruntimePage } from '@webruntime/api';
import { getLatestVersion } from '@webruntime/server/dist/commonjs/utils/utils';

const debug = debugLogger('localdevserver');

export class LocalDevPage extends WebruntimePage {
    get experimental_content() {
        const { sessionNonce }: any = this.pageContext.locals;
        const {
            buildDir,
            server: { basePath }
        } = this.pageContext.config;

        const versionKey = this.getVersionKey(buildDir);

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

        return [
            {
                code: this.createDefineModulesScript({
                    '@app/basePath': basePath,
                    '@app/csrfToken': req.csrfToken && req.csrfToken()
                })
            },
            {
                code: this.createAuraGlobalsScript({
                    // The 220-224 versions of LDS make use of aggregate-ui
                    // which does not work outside of core. This flag prevents
                    // use of it. See W-7069525. 226 LDS is supposed to remove
                    // the use of aggregate-ui, so once all orgs are 226+ this
                    // can be removed.
                    '$Browser.S1Features.isLds224Enabled': true
                })
            }
        ];
    }

    /**
     * Returns JavaScript code that will add a module with the given name and
     * constant value to the registry.
     *
     * This is meant to be injected in the HTML to define `@app/*` modules used
     * by @communities-webruntime modules.
     *
     * @param modulesMap The map of module id to the resolved value.
     */
    createDefineModulesScript(modulesMap: { [key: string]: any }) {
        const script = Object.entries(modulesMap)
            .map(([key, value]) => {
                return `Webruntime.define('${key}', [], function() {
                    return ${JSON.stringify(value)};
                 })`;
            })
            .join('\n')
            .trim();

        return script;
    }

    /**
     * Returns JavaScript code that will polyfill the global $A object (Aura
     * global object) with specified values.
     *
     * @param auraGlobalValues The map of id to return value for `$A.get`.
     */
    createAuraGlobalsScript(auraGlobalValues: { [key: string]: any } = {}) {
        const script = `
        (function() {
            const globalValues = ${JSON.stringify(auraGlobalValues)};
            if (window.$A === undefined || window.$A === null) {
                window.$A = {};
            }
            window.$A.get = function(key) {
                return globalValues[key];
            };
        })();`;

        return script;
    }

    /**
     * Returns the version key for the local dev app's static resources.
     */
    getVersionKey(buildDir: string): string {
        // use the version from package.json
        const packageJsonPath = path.join(__dirname, '../../../package.json');
        try {
            const packageJson = JSON.parse(
                fs.readFileSync(packageJsonPath, 'utf8')
            );
            if (packageJson.version) {
                return packageJson.version;
            }
        } catch (e) {
            debug(
                `warning: unable to determine versionKey from package.json ${e}`
            );
        }

        // fallback to the latest project version hash
        return getLatestVersion(buildDir);
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
