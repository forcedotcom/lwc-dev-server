import { createElement } from 'lwc';
import ResourcesPanel from 'localdevserver/resourcesPanel';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-resources-panel', {
        is: ResourcesPanel
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-resources-panel', () => {
    it('renders', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
