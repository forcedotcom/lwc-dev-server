//const { AddressableService, RequestService } = require('@webruntime/api');

import {
    AddressableService,
    RequestService,
    ContainerContext,
    RequestParams,
    RequestOutput,
    RequestOutputTypes
} from '@webruntime/api';
import { compile } from '@webruntime/compiler';
import path from 'path';

const URI = '@salesforce/label/:labelId';

// @ts-ignore
class LabelService extends AddressableService implements RequestService {
    private projectDir: string;
    private labels: { [key: string]: string };

    constructor({ projectDir }: { projectDir: string }) {
        super(URI);
        this.projectDir = projectDir;
        this.labels = {};
    }

    async initialize() {
        // initialize your service
        this.labels = require(path.join(this.projectDir, 'src/labels.json'));
    }

    /**
     * Whats a specifier?
     * @param url
     */
    toSpecifier(url: string) {
        const { labelId } = this.parseUrl(url);
        return `@salesforce/label/${labelId}`;
    }

    /**
     * NOTE: What is this?
     */
    get mappings() {
        return {
            '@salesforce/label/': '/js/labels/'
        };
    }

    async request(
        specifier: string,
        // @ts-ignore
        params: RequestParams,
        // @ts-ignore
        context: ContainerContext
        // @ts-ignore
    ): Promise<RequestOutput> {
        const { compilerConfig }: { compilerConfig?: any } = context;
        //const { namespace, name } = getNameNamespaceFromSpecifier(specifier);
        const namespace = 'c';
        const name = 'name';
        const label = this.labels[name];

        const files: { [key: string]: string } = {};
        files[`${specifier}.js`] = `export default "${label}"`;

        const { result, success, diagnostics, metadata } = await compile({
            ...compilerConfig,
            name,
            namespace,
            files
        });

        return {
            type: RequestOutputTypes.COMPONENT,
            specifier,
            resource: result,
            success,
            metadata,
            diagnostics
        };
    }
}

module.exports = {
    LabelService
};
