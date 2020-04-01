import Preview from 'localdevserver/preview';
import { createElement } from 'lwc';
import { getComponentMetadata } from 'localdevserver/projectMetadataLib';
import { subscribe } from 'webruntime_navigation/navigation';
import {
    flushPromises,
    mockComponentMetadata
} from '../../../__tests__/testutils';

jest.mock('localdevserver/projectMetadataLib');

jest.mock('webruntime_navigation/navigation', () => ({
    navigate: jest.fn(),
    generateUrl: jest.fn(() => Promise.resolve('/mock/url')),
    subscribe: jest.fn((context, callback) => {
        callback();
        return { unsubscribe: jest.fn() };
    }),
    getNavigationContextId: jest.fn()
}));

jest.mock('wire-service', () => ({
    register: jest.fn((symbol, wireCallback) => {
        wireCallback({
            addEventListener(eventName, callback) {
                callback();
            },
            dispatchEvent: jest.fn()
        });
    }),
    LinkContextEvent: jest.fn(),
    ValueChangedEvent: jest.fn()
}));

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

    it('renders a component', async () => {
        const route = {
            attributes: {
                namespace: 'c',
                name: 'button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return { unsubscribe: jest.fn() };
        });

        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const element = createComponentUnderTest();

        await flushPromises();
        expect(element).toMatchSnapshot();
    });

    it.todo(
        'should show the loading indicator before the component has rendered'
    );

    it.todo('should remove the loading indicator after the component renders');

    it.todo('should show an error message if the route is missing attributes');

    it.todo('should show an error message if the route has invalid attributes');

    it.todo('should show an error message if the component does not exist');

    it.todo('should show an error message for non custom components');

    it.todo('should show an error message if the component does not compile');

    it.todo(
        'should show an error message if the component does not have a default export'
    );

    it.todo('should show the component name on the page');
});
