// import { ComponentService } from '@webruntime/services';
import { ComponentServiceWithExclusions } from '../ComponentServiceWithExclusions';

describe('ComponentServiceWithExclusions', () => {
    it('should remove @salesforce/label from the mappings', async () => {
        const componentService = new ComponentServiceWithExclusions({
            projectDir: '',
            moduleDir: '',
            compilerConfig: { lwcOptions: {} }
        });

        componentService.mappings['@salesforce/label'] = true;
        componentService.mappings['@salesforce/notlabel'] = true;
        await componentService.initialize();

        expect(
            componentService.mappings.hasOwnProperty('@salesforce/label')
        ).toBeFalsy();
    });

    it('should leave other mappings untouched', async () => {
        const componentService = new ComponentServiceWithExclusions({
            projectDir: '',
            moduleDir: '',
            compilerConfig: { lwcOptions: {} }
        });

        componentService.mappings['@salesforce/label'] = true;
        componentService.mappings['@salesforce/notlabel'] = true;
        await componentService.initialize();

        expect(
            componentService.mappings.hasOwnProperty('@salesforce/notlabel')
        ).toBeTruthy();
    });
});
