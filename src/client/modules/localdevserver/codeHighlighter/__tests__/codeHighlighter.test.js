import { createElement } from 'lwc';
import CodeHighlighter from 'localdevserver/codeHighlighter';

jest.useFakeTimers();

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-code-highlighter', {
        is: CodeHighlighter
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}
const code = `
// this is sameple code
// forEach polyfill
Array.prototype.forEach = function(callback, thisArg) {
    if(typeof(callback) !== "function") {
        throw new TypeError(callback + " is not a function!");
    }
    var len = this.length;
    for(var i = 0; i < len; i++) {
        callback.call(thisArg, this[i], i, this)
    }
}`;
describe('localdevserver-code-highlighter', () => {
    it('renders - no code', async () => {
        const componentElement = createComponentUnderTest();
        jest.runAllTicks();
        expect(componentElement).toMatchSnapshot();
    });
    it('renders - code, no line info', async () => {
        const componentElement = createComponentUnderTest();
        jest.runAllTicks();
        componentElement.code = code;
        jest.runAllTicks();
        jest.runAllTimers();
        expect(componentElement).toMatchSnapshot();

        const pre = componentElement.shadowRoot.querySelector('pre');
        expect(pre.classList.contains('language-javascript')).toBe(true);
    });
    it('renders - code, with line info', async () => {
        const componentElement = createComponentUnderTest();
        jest.runAllTicks();
        componentElement.code = code;
        componentElement.lineOffset = 3;
        jest.runAllTicks();
        jest.runAllTimers();
        expect(componentElement).toMatchSnapshot();

        const pre = componentElement.shadowRoot.querySelector('pre');
        expect(pre.classList.contains('language-javascript')).toBe(true);
    });
});
