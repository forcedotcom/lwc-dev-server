import { createElement } from 'lwc';
import Element from 'lightning/formattedText';

const createComponent = () => {
    const element = createElement('lightning-formatted-text', { is: Element });
    document.body.appendChild(element);
    return element;
};
const exampleText =
    'I love www.salesforce.com \n And I like cats@salesforce.com';

describe('lightning-formatted-text', () => {
    it('default', () => {
        const element = createComponent();
        expect(element).toMatchSnapshot();
    });

    it('parses multiple new lines into multiple BRs', () => {
        const element = createComponent();
        element.value = 'First line \r\n\r\n Fourth line \n\n\n Eighth line';
        element.linkify = true;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('parses url after ?', () => {
        const element = createComponent();
        element.value = 'First http://www.some-business.com?a=1&b=2';
        element.linkify = true;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('with linkified text', () => {
        const element = createComponent();
        element.value = exampleText;
        element.linkify = true;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('without linkified text', () => {
        const element = createComponent();
        element.value = exampleText;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
});

describe('lightning-formatted-text edge cases', () => {
    it('url only', () => {
        const element = createComponent();
        element.value = 'www.salesforce.com';
        element.linkify = true;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('newline only', () => {
        const element = createComponent();
        element.value = '\r\n';
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('empty value', () => {
        const element = createComponent();
        element.value = null;
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('empty text', () => {
        const element = createComponent();
        element.value = '';
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });

    it('url and newline', () => {
        const element = createComponent();
        element.value = 'www.salesforce.com\r\n';
        return Promise.resolve().then(() => {
            expect(element).toMatchSnapshot();
        });
    });
});
