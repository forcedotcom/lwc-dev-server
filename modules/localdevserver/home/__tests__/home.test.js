import { createElement } from 'lwc';
import Home from '../home';

// jest.useFakeTimers();

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-home', {
        is: Home
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('home.js', () => {
    // afterEach(() => {
    //     while (document.body.firstChild) {
    //         document.body.removeChild(document.body.firstChild);
    //     }
    //     jest.clearAllMocks();
    // });

    beforeAll(() => {
        const mockFetchPromise = Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        htmlName: 'c-cmp-a',
                        jsName: 'c/cmpA',
                        namespace: 'c',
                        name: 'cmpA',
                        url: '/preview/c/cmpA'
                    },
                    {
                        htmlName: 'c-cmp-b',
                        jsName: 'c/cmpB',
                        namespace: 'c',
                        name: 'cmpB',
                        url: '/preview/c/cmpB'
                    }
                ])
        });
        global.fetch = jest.fn(() => mockFetchPromise);
    });

    // afterAll

    it('renders components panel', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
