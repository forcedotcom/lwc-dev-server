import { createElement } from 'lwc';
import LayoutSection from 'localdevserver/layoutSection';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-layout-section', {
        is: LayoutSection
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-layout-section', () => {
    it('renders', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });

    it('renders when specifying mainContent as true', () => {
        const componentElement = createComponentUnderTest({
            mainContent: true
        });
        expect(componentElement).toMatchSnapshot();
    });
});
