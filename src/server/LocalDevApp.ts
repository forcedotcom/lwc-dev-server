const { WebruntimeAppDefinition, WebruntimePage } = require('@webruntime/api');

// workaround for webruntime typescript support
export { WebruntimeAppDefinition, WebruntimePage };

export class LocalDevPage extends WebruntimePage {
    get experimental_content() {
        const {
            locals: { sessionNonce },
            config: {
                server: { basePath }
            }
        } = this.pageContext;

        // TODO: The version key needs to be calculated until LWR provides it in 228.
        const versionKey = '123456';

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
}

export class LocalDevApp extends WebruntimeAppDefinition {
    get pages() {
        return [
            {
                route: '/',
                page: LocalDevPage
            }
        ];
    }
}
