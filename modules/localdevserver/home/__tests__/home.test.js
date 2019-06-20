import { createElement } from 'lwc';
import { flushPromises } from '../../../__tests__/testutils';
import Home from '../home';

describe('home.js', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    beforeAll(() => {
        const mockFetchPromise = Promise.resolve({
            json: () =>
                Promise.resolve([
                    { title: 'c-test1', url: '/preview/c/test1' },
                    { title: 'c-cmp2', url: '/preview/c/cmp2' }
                ])
        });
        global.fetch = jest.fn(() => mockFetchPromise);
    });

    it('lists components', () => {
        const element = createElement('localdevserver-home', { is: Home });
        document.body.appendChild(element);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        return flushPromises().then(() => {
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
    });

    it('filters components', () => {
        const element = createElement('localdevserver-home', { is: Home });
        document.body.appendChild(element);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        return flushPromises().then(() => {
            const search = element.shadowRoot.querySelector(
                'input[name="component-filter"]'
            );
            search.value = 'cmp';
            search.dispatchEvent(new CustomEvent('change'));

            return flushPromises().then(() => {
                const componentList = element.shadowRoot.querySelector(
                    '.component-list'
                );
                expect(componentList.children.length).toBe(1);
                expect(componentList.children[0].children[0].href).toMatch(
                    new RegExp('/preview/c/cmp2$')
                );
            });
        });
    });
});
