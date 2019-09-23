import { createElement } from 'lwc';
import Home from '../home';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-home', {
        is: Home
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('home.js', () => {
    it('renders', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
