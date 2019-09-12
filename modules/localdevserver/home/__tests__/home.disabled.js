import { createElement } from 'lwc';
import Home from '../home';
import { flushPromises } from '../../../__tests__/testutils';

jest.useFakeTimers();

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-home', {
        is: Home
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('home.js', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    beforeAll(() => {
        const mockFetchPromise = Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    { title: 'c-test1', url: '/preview/c/test1' },
                    { title: 'c-cmp2', url: '/preview/c/cmp2' }
                ])
        });
        global.fetch = jest.fn(() => mockFetchPromise);
    });

    it('lists components', async () => {
        const element = createComponentUnderTest();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        await flushPromises();

        const componentList = element.shadowRoot.querySelector(
            '.component-list'
        );
        expect(componentList.children.length).toBe(2);
        expect(componentList.children[0].children[0].href).toMatch(
            new RegExp('/preview/c/test1$')
        );
        expect(componentList.children[1].children[0].href).toMatch(
            new RegExp('/preview/c/cmp2$')
        );
    });

    it('filters components', async () => {
        const element = createComponentUnderTest();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        await flushPromises();
        const search = element.shadowRoot.querySelector(
            'input[name="component-filter"]'
        );
        search.value = 'cmp';
        search.dispatchEvent(new CustomEvent('change'));

        await flushPromises();
        const componentList = element.shadowRoot.querySelector(
            '.component-list'
        );
        expect(componentList.children.length).toBe(1);
        expect(componentList.children[0].children[0].href).toMatch(
            new RegExp('/preview/c/cmp2$')
        );
    });

    it('fires toast event when componentList request fails', async () => {
        const mockFetchPromise = Promise.resolve({
            ok: false,
            text: () => Promise.resolve('some kind of error')
        });
        global.fetch = jest.fn(() => mockFetchPromise);

        const element = createComponentUnderTest();
        let dispatchEventCalled = false;
        element.addEventListener(
            'lightning__showtoast',
            () => (dispatchEventCalled = true)
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
        await flushPromises();
        expect(dispatchEventCalled).toBeTruthy();
    });
});
