import { createElement } from 'lwc';
import ErrorStacks from 'localdevserver/error';

jest.useFakeTimers();

// this is indirectly imported by talon framework stuff, and needs to be mocked!
jest.mock(
    '@webruntime/connect-gen/dist/forceChatterApi/util/util',
    () => ({}),
    {
        virtual: true
    }
);

const errors = {};
errors.simple = new Error('simple error');
errors.arraystack = new Error('array stack');
errors.arraystack.stack = ['one,two,three'];
errors.withfilename = new Error('with filename');
errors.withfilename.filename = '/filename.js';
errors.withfilename.stack = `SyntaxError: /Users/midzelis/git/duck.burrito/ebikes-lwc/force-app/main/default/lwc/productTile/productTile.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"
7 | export default class ProductTile extends LightningElement {
8 |     /** Whether the tile is draggable. */
>  9 |     @api draggable;
    |     ^
10 |
11 |     _product;
12 |     /** Product__c to display. */
    at File.buildCodeFrameError (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/core/lib/transformation/file/file.js:261:12)
    at NodePath.buildCodeFrameError (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/path/index.js:157:21)
    at generateError (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/babel-plugin-component/src/utils.js:116:26)
    at PluginPass.Decorator (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/babel-plugin-component/src/decorators/index.js:185:19)
    at newFn (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/visitors.js:193:21)
    at NodePath._call (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/path/context.js:53:20)
    at NodePath.call (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/path/context.js:40:17)
    at NodePath.visit (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/path/context.js:88:12)
    at TraversalContext.visitQueue (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/context.js:118:16)
    at TraversalContext.visitMultiple (/Users/midzelis/git/duck.burrito/talon/packages/talon-compiler/node_modules/@lwc/compiler/node_modules/@babel/traverse/lib/context.js:85:17)`;
errors.withfilenameandline = new Error('with filename and line');
errors.withfilenameandline.filename = errors.withfilename.filename;
errors.withfilenameandline.stack = errors.withfilename.stack;
errors.withfilenameandline.location = { line: 9, column: 4 };
errors.filenameinmessage = new Error(
    `${errors.withfilename.filename}: with filename in message`
);
errors.filenameinmessage.filename = errors.withfilename.filename;
errors.filenameinmessage.stack = errors.withfilename.stack;
errors.filenameinmessage.location = { line: 9, column: 4 };

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-error', {
        is: ErrorStacks
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('localdevserver-error-stacks', () => {
    it('renders - no error', () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });
    it.each(Object.keys(errors).map(key => [key, errors[key]]))(
        'renders - %s',
        async (errorName, error) => {
            global.fetch = jest.fn();
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve('file_content')
                })
            );

            const componentElement = createComponentUnderTest({ error });
            jest.runAllTicks();
            jest.runAllTimers();
            if (error.filename) {
                const href = componentElement.shadowRoot
                    .querySelector('a')
                    .getAttribute('href');
                if (error.location) {
                    expect(href).toBe(
                        `vscode://file${error.filename}:${error.location.line}:${error.location.column}`
                    );
                } else {
                    expect(href).toBe(`vscode://file${error.filename}`);
                }
            }
            const errorMsg = componentElement.shadowRoot.querySelector(
                '.error-message'
            ).textContent;
            expect(errorMsg).toMatchSnapshot();
        }
    );
});
