const CONTAINER_SELECTOR = '.resource-container';
const DYNAMIC_ELEMENT_SELECTOR = '.resource-container div';

const CONTAINER_SIZE = { width: 50, height: 55 };
const DYNAMIC_ELEMENT_SIZE = { width: 40, height: 45 };

function getComputedStyle(el, prop) {
    const style = window.document.defaultView.getComputedStyle(el);
    return style.getPropertyValue(prop);
}

describe('resource-loader integration, testing demo library', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('should create the container', () => {
        $(CONTAINER_SELECTOR).waitForExist();
    });

    it('should create dynamic elements', () => {
        $(DYNAMIC_ELEMENT_SELECTOR).waitForExist();
    });

    it('should apply styles to container', () => {
        $(CONTAINER_SELECTOR).waitForExist();
        const size = $(CONTAINER_SELECTOR).getSize();
        expect(size.height).to.equal(CONTAINER_SIZE.height);
        expect(size.width).to.equal(CONTAINER_SIZE.width);
    });

    it('should apply styles to dynamic elements', () => {
        $(DYNAMIC_ELEMENT_SELECTOR).waitForExist();
        const size = $(DYNAMIC_ELEMENT_SELECTOR).getSize();
        expect(size.height).to.equal(DYNAMIC_ELEMENT_SIZE.height);
        expect(size.width).to.equal(DYNAMIC_ELEMENT_SIZE.width);
    });
});
