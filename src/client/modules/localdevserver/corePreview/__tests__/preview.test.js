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
    let subscriptionMock;
    let consoleLogMock;
    let consoleWarnMock;
    let consoleErrorMock;
    let consoleGroupMock;

    beforeEach(() => {
        subscriptionMock = {
            unsubscribe: jest.fn()
        };

        consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        consoleGroupMock = jest.spyOn(console, 'group').mockImplementation();
    });

    afterEach(() => {
        jest.resetAllMocks();
        consoleLogMock.mockRestore();
        consoleWarnMock.mockRestore();
        consoleErrorMock.mockRestore();
        consoleGroupMock.mockRestore();
    });

    it('renders the component', async () => {
        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const route = {
            attributes: {
                namespace: 'c',
                name: 'button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();

        await flushPromises();
        expect(element).toMatchSnapshot();
    });

    it('should show a loading indicator', async () => {
        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const route = {
            attributes: {
                namespace: 'c',
                name: 'button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();

        let spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).toBeTruthy();

        await flushPromises();

        spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).toBeFalsy();
    });

    it('should show an error message if the route is missing the attributes', async () => {
        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const route = {
            state: {
                namespace: 'c',
                name: 'button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();
        await flushPromises();

        const errorEl = element.shadowRoot.querySelector(
            'localdevserver-error'
        );
        expect(errorEl).toBeTruthy();

        const errorText = errorEl.shadowRoot.textContent;
        expect(errorText).toContain(
            'The component to preview was not specified'
        );
    });

    it('should show an error message if the route has invalid attributes', async () => {
        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const route = {
            attributes: {
                specifier: 'c/button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();
        await flushPromises();

        const errorEl = element.shadowRoot.querySelector(
            'localdevserver-error'
        );
        expect(errorEl).toBeTruthy();

        const errorText = errorEl.shadowRoot.textContent;
        expect(errorText).toContain(
            'The component to preview was not specified'
        );
    });

    it('should show an error message if the component is not found in the metadata', async () => {
        getComponentMetadata.mockImplementation(() => {
            throw new Error('not found');
        });

        const route = {
            attributes: {
                namespace: 'c',
                name: 'foo'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();
        await flushPromises();

        const errorEl = element.shadowRoot.querySelector(
            'localdevserver-error'
        );
        expect(errorEl).toBeTruthy();

        const errorText = errorEl.shadowRoot.textContent;
        expect(errorText).toContain(
            `The component named 'c/foo' was not found`
        );
    });

    it.todo('should show an error message if the component has compile errors');

    it('should call unsubscribe when disconnected', () => {
        getComponentMetadata.mockImplementation(() => {
            return Promise.resolve(mockComponentMetadata('c', 'button'));
        });

        const route = {
            attributes: {
                namespace: 'c',
                name: 'button'
            }
        };

        subscribe.mockImplementation((context, callback) => {
            callback(route);
            return subscriptionMock;
        });

        const element = createComponentUnderTest();
        element.parentNode.removeChild(element);

        expect(subscriptionMock.unsubscribe).toBeCalledTimes(1);
    });
});
