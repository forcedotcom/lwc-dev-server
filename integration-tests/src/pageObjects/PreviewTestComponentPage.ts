import PreviewPage from './PreviewPage';

/**
 * A preview page for a test project containing an LWC module named
 * `test-component`.
 */
class PreviewTestComponentPage extends PreviewPage {
    public get lightningIcon() {
        return this.testComponent.then(el => el.shadow$('lightning-icon'));
    }

    public get lightningIconHref() {
        return this.lightningIcon
            .then(el => el.shadow$('lightning-primitive-icon'))
            .then(el => el.shadow$('use'))
            .then(el => el.getAttribute('xlink:href'));
    }
}
export default new PreviewTestComponentPage('test', 'component');
