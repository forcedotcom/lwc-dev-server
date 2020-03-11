const { WebruntimeAppDefinition, WebruntimePage } = require('@webruntime/api');

// workaround for webruntime typescript support
export { WebruntimeAppDefinition, WebruntimePage };

export class LocalDevPage extends WebruntimePage {
    get experimental_content() {
        const {
            config: {
                server: { basePath }
            }
        } = this.pageContext;

        // TODO: The version key needs to be calculated until LWR provides it in 228.
        const versionKey = '123456';

        // Replace template variables with properties from the Page Context.
        return this.pageContext.templateContent
            .replace(/{\s*basePath\s*}/g, basePath)
            .replace(/{\s*versionKey\s*}/g, versionKey);
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
