import { createElement } from 'lwc';
import Preview from 'localdevserver/preview';
import { createElement as talonCreateElement } from 'talon/componentService';
import { flushPromises } from '../../../__tests__/testutils';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';

// this is indirectly imported by talon framework stuff, and needs to be mocked!
jest.mock('@talon/connect-gen/dist/forceChatterApi/util/util', () => ({}), {
    virtual: true
});

jest.mock('talon/componentService', () => ({
    createElement: jest.fn()
}));

jest.mock('localdevserver/projectMetadataLib');

// jest.mock('localdevserver/projectMetadataLib', () => ({
//     getComponentMetadata: jest.fn()
// }));

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-preview', { is: Preview });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('preview', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('renders', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });

    it('renders a component', async () => {
        talonCreateElement.mockImplementation(() => {
            const el = document.createElement('div');
            el.appendChild(document.createTextNode('test element'));
            return Promise.resolve(el);
        });

        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve({
                namespace: 'c',
                name: 'foo',
                jsName: 'c/foo',
                htmlName: 'c-foo',
                url: 'test/c/foo',
                path: '/Users/arya/dev/test/src/foo/foo.js'
            });
        });

        const componentElement = createComponentUnderTest({
            cmp: 'c/foo'
        });

        await flushPromises();
        expect(componentElement).toMatchSnapshot();
    });

    it('displays errors', async () => {
        talonCreateElement.mockImplementation(() => {
            const el = document.createElement('div');
            el.appendChild(document.createTextNode('test element'));
            return Promise.reject('test error');
        });

        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve({
                namespace: 'c',
                name: 'foo',
                jsName: 'c/foo',
                htmlName: 'c-foo',
                url: 'test/c/foo',
                path: '/Users/arya/dev/test/src/foo/foo.js'
            });
        });

        const componentElement = createComponentUnderTest({
            cmp: 'c/foo'
        });

        await flushPromises();
        expect(componentElement).toMatchSnapshot();
    });
});
