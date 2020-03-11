import { createElement } from 'lwc';
import ErrorStacks from 'localdevserver/errorStacks';
import { flushPromises } from '../../../__tests__/testutils';

jest.useFakeTimers();

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-error-stacks', {
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
    it('renders - error - string stack', () => {
        const err = new Error();
        const componentElement = createComponentUnderTest({ error: err });
        jest.runAllTicks();
        const container = componentElement.shadowRoot.querySelector(
            '.collapse'
        );
        const len = err.stack.split('\n').length;
        expect(container.textContent).toMatch(`${len} stack frames collapsed`);
    });
    it('renders - error - array stack', () => {
        const err = new Error();
        err.stack = ['one,two,three'];
        const componentElement = createComponentUnderTest({ error: err });
        jest.runAllTicks();
        const container = componentElement.shadowRoot.querySelector(
            '.collapse'
        );
        const len = err.stack.length;
        expect(container.textContent).toMatch(`${len} stack frames collapsed`);
    });
    it('renders - error expanded', async () => {
        const err = new Error();
        const componentElement = createComponentUnderTest({ error: err });

        var evt = new Event('click');
        const container = componentElement.shadowRoot.querySelector(
            '.button-container'
        );
        container.dispatchEvent(evt);
        await flushPromises();
        const pre = componentElement.shadowRoot.querySelector('pre');

        expect(pre.textContent).toMatch(err.stack);

        const collapse = componentElement.shadowRoot.querySelector('.collapse');
        expect(collapse.textContent).toMatch(`Collapse stack frames`);
    });
    it('renders - error expanded - filter context from stack', async () => {
        const err = new Error();
        err.filename = "doesn't matter";
        err.stack = `SyntaxError: /Users/midzelis/git/duck.burrito/ebikes-lwc/force-app/main/default/lwc/productTile/productTile.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"
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
        const componentElement = createComponentUnderTest({ error: err });

        var evt = new Event('click');
        const container = componentElement.shadowRoot.querySelector(
            '.button-container'
        );
        container.dispatchEvent(evt);
        await flushPromises();
        const pre = componentElement.shadowRoot.querySelector('pre');

        const noContext = `SyntaxError: /Users/midzelis/git/duck.burrito/ebikes-lwc/force-app/main/default/lwc/productTile/productTile.js: LWC1100: Invalid decorator usage. Supported decorators (api, wire, track) should be imported from "lwc"
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

        expect(pre.textContent).toMatch(noContext);

        const collapse = componentElement.shadowRoot.querySelector('.collapse');
        expect(collapse.textContent).toMatch(`Collapse stack frames`);
    });
});
