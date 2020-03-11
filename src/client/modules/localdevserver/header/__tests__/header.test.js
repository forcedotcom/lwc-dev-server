import { createElement } from 'lwc';
import Header from 'localdevserver/header';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-header', {
        is: Header
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-header', () => {
    it('renders', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
