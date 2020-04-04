import { createElement } from 'lwc';
import View from 'localdevserver/view';
import { subscribe } from 'webruntime_navigation/navigation';

jest.mock('webruntime_navigation/navigation', () => ({
    navigate: jest.fn(),
    generateUrl: jest.fn(() => Promise.resolve('/mock/url')),
    subscribe: jest.fn((context, callback) => {
        callback();
        return { unsubscribe: jest.fn() };
    }),
    getNavigationContextId: jest.fn()
}));

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-view', {
        is: View
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('view.js', () => {
    it('renders', async () => {
        subscribe.mockImplementation((_context, callback) => {
            callback({}, { component: 'localdevserver/page' });
            return { unsubscribe: jest.fn() };
        });

        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });

    it('shows 404 message when the route is not defined', async () => {
        subscribe.mockImplementation((_context, callback) => {
            callback({}, null);
            return { unsubscribe: jest.fn() };
        });

        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
});
