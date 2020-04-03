import { createElement } from 'lwc';
import App from 'localdevserver/app';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-app', {
        is: App
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('app.js', () => {
    it('renders', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
