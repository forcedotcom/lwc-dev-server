const assert = require('assert');

const SELECTOR_HOST = `buttongroup-buttongroup`;
const SELECTOR_BUTTONGROUP = `lightning-button-group`;
const SELECTOR_SLOT_CHILDREN = `${SELECTOR_BUTTONGROUP} > slot > *`;
const SELECTOR_SLOT_FIRST_CHILD_BUTTON = `${SELECTOR_SLOT_CHILDREN}:first-child .slds-button`;
const SELECTOR_SLOT_NTH_CHILD_BUTTON = `${SELECTOR_SLOT_CHILDREN}:nth-child(::index::) .slds-button`;
const SELECTOR_SLOT_LAST_CHILD_BUTTON = `${SELECTOR_SLOT_CHILDREN}:last-child .slds-button`;

const CSS_BUTTON_FIRST = `slds-button_first`;
const CSS_BUTTON_MIDDLE = `slds-button_middle`;
const CSS_BUTTON_LAST = `slds-button_last`;

/*
 * These tests only exist due to the lack of `slotchange` support in the Jest environment.
 * The below tests validate structure and reaction and not user interaction intentionally.
 * Interaction is tested in each child component type (various button components).
 */

describe('lightning-button-group - validate `slotchange` functionality due to lack of support in Jest/jsdom', () => {
    beforeEach(() => {
        const URL = browser.getStaticUrl(__filename);
        browser.url(URL);
    });

    it('each child button element should have the correct position/order SLDS class when initially rendered', () => {
        const totalNumChildren = $(SELECTOR_HOST).getAttribute(
            'totalInitialNumberButtons'
        );
        const children = $$(SELECTOR_SLOT_CHILDREN);
        assert(
            children.length == totalNumChildren,
            `Total number of children should be ${totalNumChildren}`
        );

        // validate first button
        const hasFirstClass = $(SELECTOR_SLOT_FIRST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_FIRST);
        assert(
            hasFirstClass === true,
            `First button should have CSS class of '${CSS_BUTTON_FIRST}'.`
        );

        // validate middle buttons
        for (let i = 1; i < children.length - 2; i++) {
            const hasMiddleClass = $(
                SELECTOR_SLOT_NTH_CHILD_BUTTON.replace('::index::', i + 1)
            )
                .getAttribute('class')
                .includes(CSS_BUTTON_MIDDLE);
            assert(
                hasMiddleClass === true,
                `Middle button should have CSS class of '${CSS_BUTTON_MIDDLE}'.`
            );
        }

        // validate last button
        const hasLastClass = $(SELECTOR_SLOT_LAST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_LAST);
        assert(
            hasLastClass === true,
            `Last button should have CSS class of '${CSS_BUTTON_LAST}'.`
        );
    });

    it('each child button element should have the correct position/order SLDS class when a button is appended', () => {
        // validate initial number of buttons
        const totalNumChildren = parseInt(
            $(SELECTOR_HOST).getAttribute('totalInitialNumberButtons')
        );
        let children = $$(SELECTOR_SLOT_CHILDREN);
        assert(
            children.length == totalNumChildren,
            `Total number of children should be ${totalNumChildren}`
        );

        // append a button and wait for the total count to update
        $('.button_append').click();
        browser.waitUntil(() => {
            const updatedChildren = $$(SELECTOR_SLOT_CHILDREN);
            return updatedChildren.length === totalNumChildren + 1;
        });

        // retrieve updated children
        children = $$(SELECTOR_SLOT_CHILDREN);

        // validate first button
        const hasFirstClass = $(SELECTOR_SLOT_FIRST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_FIRST);
        assert(
            hasFirstClass === true,
            `First button should have CSS class of '${CSS_BUTTON_FIRST}'.`
        );

        // validate middle buttons
        for (let i = 1; i < children.length - 2; i++) {
            const hasMiddleClass = $(
                SELECTOR_SLOT_NTH_CHILD_BUTTON.replace('::index::', i + 1)
            )
                .getAttribute('class')
                .includes(CSS_BUTTON_MIDDLE);
            assert(
                hasMiddleClass === true,
                `Middle button should have CSS class of '${CSS_BUTTON_MIDDLE}'.`
            );
        }

        // validate last button
        const hasLastClass = $(SELECTOR_SLOT_LAST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_LAST);
        assert(
            hasLastClass === true,
            `Last button should have CSS class of '${CSS_BUTTON_LAST}'.`
        );
    });

    it('each child button element should have the correct position/order SLDS class when a button is prepended', () => {
        // validate initial number of buttons
        const totalNumChildren = parseInt(
            $(SELECTOR_HOST).getAttribute('totalInitialNumberButtons')
        );
        let children = $$(SELECTOR_SLOT_CHILDREN);
        assert(
            children.length == totalNumChildren,
            `Total number of children should be ${totalNumChildren}`
        );

        // append a button and wait for the total count to update
        $('.button_prepend').click();
        browser.waitUntil(() => {
            const updatedChildren = $$(SELECTOR_SLOT_CHILDREN);
            return updatedChildren.length === totalNumChildren + 1;
        });

        // retrieve updated children
        children = $$(SELECTOR_SLOT_CHILDREN);

        // validate first button
        const hasFirstClass = $(SELECTOR_SLOT_FIRST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_FIRST);
        assert(
            hasFirstClass === true,
            `First button should have CSS class of '${CSS_BUTTON_FIRST}'.`
        );

        // validate middle buttons
        for (let i = 1; i < children.length - 2; i++) {
            const hasMiddleClass = $(
                SELECTOR_SLOT_NTH_CHILD_BUTTON.replace('::index::', i + 1)
            )
                .getAttribute('class')
                .includes(CSS_BUTTON_MIDDLE);
            assert(
                hasMiddleClass === true,
                `Middle button should have CSS class of '${CSS_BUTTON_MIDDLE}'.`
            );
        }

        // validate last button
        const hasLastClass = $(SELECTOR_SLOT_LAST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_LAST);
        assert(
            hasLastClass === true,
            `Last button should have CSS class of '${CSS_BUTTON_LAST}'.`
        );
    });

    it('each child button element should have the correct position/order SLDS class when a button is inserted', () => {
        // validate initial number of buttons
        const totalNumChildren = parseInt(
            $(SELECTOR_HOST).getAttribute('totalInitialNumberButtons')
        );
        let children = $$(SELECTOR_SLOT_CHILDREN);
        assert(
            children.length == totalNumChildren,
            `Total number of children should be ${totalNumChildren}`
        );

        // append a button and wait for the total count to update
        $('.button_insert').click();
        browser.waitUntil(() => {
            const updatedChildren = $$(SELECTOR_SLOT_CHILDREN);
            return updatedChildren.length === totalNumChildren + 1;
        });

        // retrieve updated children
        children = $$(SELECTOR_SLOT_CHILDREN);

        // validate first button
        const hasFirstClass = $(SELECTOR_SLOT_FIRST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_FIRST);
        assert(
            hasFirstClass === true,
            `First button should have CSS class of '${CSS_BUTTON_FIRST}'.`
        );

        // validate middle buttons
        for (let i = 1; i < children.length - 2; i++) {
            const hasMiddleClass = $(
                SELECTOR_SLOT_NTH_CHILD_BUTTON.replace('::index::', i + 1)
            )
                .getAttribute('class')
                .includes(CSS_BUTTON_MIDDLE);
            assert(
                hasMiddleClass === true,
                `Middle button should have CSS class of '${CSS_BUTTON_MIDDLE}'.`
            );
        }

        // validate last button
        const hasLastClass = $(SELECTOR_SLOT_LAST_CHILD_BUTTON)
            .getAttribute('class')
            .includes(CSS_BUTTON_LAST);
        assert(
            hasLastClass === true,
            `Last button should have CSS class of '${CSS_BUTTON_LAST}'.`
        );
    });
});
