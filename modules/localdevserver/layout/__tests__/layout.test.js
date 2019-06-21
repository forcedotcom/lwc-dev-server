import { createElement } from 'lwc';
import Layout from 'localdevserver/layout';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-layout', {
        is: Layout
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-error-stacks', () => {
    it('renders', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
