import { createElement } from 'lwc';
import App from 'localdevserver/app';

jest.mock('webruntime/aura', () => ({}), { virtual: true });
jest.mock('webruntime/auraStorage', () => ({}), { virtual: true });
jest.mock('webruntime/auraInstrumentation', () => ({}), { virtual: true });
jest.mock('webruntime/logger', () => ({}), { virtual: true });
jest.mock(
    'lightning/configProvider',
    () => ({
        __esModule: true,
        default: jest.fn()
    }),
    { virtual: true }
);

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-app', {
        is: App
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('app.js', () => {
    let originalWebruntime;

    beforeEach(() => {
        originalWebruntime = global.Webruntime;
        global.Webruntime = {
            define: jest.fn()
        };
    });

    afterEach(() => {
        global.Webruntime = originalWebruntime;
    });

    it('renders', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
