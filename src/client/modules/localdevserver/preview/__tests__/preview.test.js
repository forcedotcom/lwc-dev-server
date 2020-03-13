import { createElement } from 'lwc';
import Preview from 'localdevserver/preview';
// import { createElement as talonCreateElement } from 'webruntime/componentService';
import { flushPromises } from '../../../__tests__/testutils';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';

// this is indirectly imported by talon framework stuff, and needs to be mocked!
jest.mock(
    '@webruntime/connect-gen/dist/forceChatterApi/util/util',
    () => ({}),
    {
        virtual: true
    }
);

// jest.mock('webruntime/componentService', () => ({
//     createElement: jest.fn()
// }));

jest.mock('localdevserver/projectMetadataLib');

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

    // it('renders a component', async done => {
    //     talonCreateElement.mockImplementation(() => {
    //         const el = document.createElement('div');
    //         el.appendChild(document.createTextNode('test element'));
    //         return Promise.resolve(el);
    //     });

    //     getComponentMetadata.mockImplementation(() => {
    //         return Promise.resolve({
    //             namespace: 'c',
    //             name: 'foo',
    //             jsName: 'c/foo',
    //             htmlName: 'c-foo',
    //             url: 'test/c/foo',
    //             path: '/Users/arya/dev/test/src/foo/foo.js'
    //         });
    //     });

    //     const componentElement = createComponentUnderTest({
    //         cmp: 'c/foo'
    //     });

    //     // FIXME remove timeout
    //     setTimeout(async () => {
    //         await flushPromises();
    //         expect(componentElement).toMatchSnapshot();
    //         done();
    //     }, 0);
    // });

    // it('displays errors', async () => {
    //     talonCreateElement.mockImplementation(() => {
    //         const el = document.createElement('div');
    //         el.appendChild(document.createTextNode('test element'));
    //         return Promise.reject('test error');
    //     });

    //     getComponentMetadata.mockImplementation(() => {
    //         return Promise.resolve({
    //             namespace: 'c',
    //             name: 'foo',
    //             jsName: 'c/foo',
    //             htmlName: 'c-foo',
    //             url: 'test/c/foo',
    //             path: '/Users/arya/dev/test/src/foo/foo.js'
    //         });
    //     });

    //     const componentElement = createComponentUnderTest({
    //         cmp: 'c/foo'
    //     });

    //     await flushPromises();
    //     expect(componentElement).toMatchSnapshot();
    // });

    // it('returns the cmp property value', async () => {
    //     talonCreateElement.mockImplementation(() => {
    //         const el = document.createElement('div');
    //         el.appendChild(document.createTextNode('test element'));
    //         return Promise.resolve(el);
    //     });

    //     getComponentMetadata.mockImplementation(() => {
    //         return Promise.resolve({
    //             namespace: 'c',
    //             name: 'foo',
    //             jsName: 'c/foo',
    //             htmlName: 'c-foo',
    //             url: 'test/c/foo',
    //             path: '/Users/arya/dev/test/src/foo/foo.js'
    //         });
    //     });

    //     const componentElement = createComponentUnderTest({
    //         cmp: 'c/foo'
    //     });
    //     expect(componentElement.cmp).toBe('c/foo');
    // });
});