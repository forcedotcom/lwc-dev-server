import { createElement } from 'lwc';
import ErrorStacks from 'localdevserver/error';

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-error', {
        is: ErrorStacks
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-error-stacks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should render no error', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });

    it('should render simple errors', () => {
        const componentElement = createComponentUnderTest({
            error: {
                message: 'simple error message'
            }
        });
        const errorMsg = componentElement.shadowRoot.querySelector(
            '.error-message'
        ).textContent;
        expect(errorMsg).toMatchSnapshot();
    });

    it('should trigger fetch call', async () => {
        const mockComponentDidMount = {
            ok: true,
            json: () =>
                Promise.resolve({
                    errors: [
                        {
                            location: { line: 1, column: 2 },
                            message:
                                'SyntaxError: /Users/sample/ebikes-lwc/force-app/main/default/lwc/productTile/productTile.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"',
                            code: `
                            7 | export default class ProductTile extends LightningElement {
                            8 |     /** Whether the tile is draggable. */
                            >  9 |     @api draggable;
                                |     ^
                            10 |
                            11 |     _product;`,
                            filename: 'productTile.js'
                        }
                    ]
                })
        };

        global.fetch = jest
            .fn()
            .mockReturnValue(Promise.resolve(mockComponentDidMount));

        const componentElement = createComponentUnderTest({
            error: {
                specifier: 'c/productTile'
            }
        });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        /* 
        NOTE: wasn't able to run the test and wait for the fetch mock to finish running before
        asserting, will keep looking for how to accomplish that
        const href = componentElement.shadowRoot
            .querySelector('a')
            .getAttribute('href');

        expect(href).toBe(
            `vscode://file${error.filename}:${error.location.line}:${error.location.column}`
        ); */
    });
});
