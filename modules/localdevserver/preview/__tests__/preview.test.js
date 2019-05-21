import { createElement } from 'lwc';
import Preview from 'localdevserver/preview';

// this is indirectly imported by talon framework stuff, and needs to be mocked!
jest.mock('@talon/connect-gen/dist/forceChatterApi/util/util', () => ({}), {
    virtual: true
});

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-preview', { is: Preview });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('preview', () => {
    it('renders', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
