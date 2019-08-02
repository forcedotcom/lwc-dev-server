import { createElement } from 'lwc';
import { shadowQuerySelector } from 'lightning/testUtils';
import Element from 'lightning/menuItem';

const createMenuItem = () => {
    const element = createElement('lightning-menu-item', { is: Element });
    document.body.appendChild(element);
    return element;
};

describe('lightning-menu-item-default', () => {
    it('should default', () => {
        const menuItem = createMenuItem();

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });
});

describe('lightning-menu-item-label', () => {
    it('should show label', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });
});

describe('lightning-menu-item-iconName', () => {
    it('should show label and iconName', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.iconName = 'utility:table';

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });
});

describe('lightning-menu-item-checked', () => {
    it('should show has role meuitemcheckbox', () => {
        // note that what .slds-icon_selected does its to hide the checked icon
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.iconName = 'utility:table';
        menuItem.checked = false;

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });

    it('should show has role meuitemcheckbox with aria-checked-true and checked icon', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.iconName = 'utility:table';
        menuItem.checked = true;

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });
    it('should have role menuitem without aria-checked and without checked icon', () => {
        // note that what .slds-icon_selected does its to hide the checked icon
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.iconName = 'utility:table';
        menuItem.checked = undefined;

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });

    it('should react to changes in checked attribute', () => {
        // note that what .slds-icon_selected does its to hide the checked icon
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.iconName = 'utility:table';
        menuItem.checked = true;

        return Promise.resolve()
            .then(() => {
                expect(
                    shadowQuerySelector(menuItem, 'a').getAttribute(
                        'aria-checked'
                    )
                ).toBe('true');
                expect(
                    shadowQuerySelector(
                        menuItem,
                        'span.slds-truncate > lightning-primitive-icon'
                    )
                ).not.toBeNull();
                menuItem.checked = undefined;
            })
            .then(() => {
                expect(
                    shadowQuerySelector(menuItem, 'a').getAttribute(
                        'aria-checked'
                    )
                ).toBe(null);
                expect(
                    shadowQuerySelector(
                        menuItem,
                        'span.slds-truncate > lightning-primitive-icon'
                    )
                ).toBeNull();
                menuItem.checked = false;
            })
            .then(() => {
                expect(
                    shadowQuerySelector(menuItem, 'a').getAttribute(
                        'aria-checked'
                    )
                ).toBe('false');
                expect(
                    shadowQuerySelector(
                        menuItem,
                        'span.slds-truncate > lightning-primitive-icon'
                    )
                ).not.toBeNull();
            });
    });
});

describe('lightning-menu-item-disabled', () => {
    it('should be disabled', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.checked = false;
        menuItem.disabled = true;

        return Promise.resolve().then(() => {
            expect(menuItem).toMatchSnapshot();
        });
    });

    it('should be disabled when its truthy', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.disabled = 'false';

        return Promise.resolve().then(() => {
            const anchor = shadowQuerySelector(
                menuItem,
                'a[aria-disabled=true]'
            );
            expect(anchor).toBeTruthy();
        });
    });

    it('should be enabled when not present', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';

        return Promise.resolve().then(() => {
            const anchor = shadowQuerySelector(
                menuItem,
                'a[aria-disabled=true]'
            );
            expect(anchor).toBeFalsy();
        });
    });
});

describe('lightning-menu-item-onprivateselect', () => {
    const runCallbackTest = (disabled, calledTimes) => {
        return () => {
            const menuItem = createMenuItem();
            menuItem.label = 'test-label';
            menuItem.disabled = disabled;

            const callback = jest.fn();
            menuItem.addEventListener('privateselect', callback);

            return Promise.resolve()
                .then(() => {
                    shadowQuerySelector(menuItem, 'a').click();
                })
                .then(() => {
                    expect(callback.mock.calls).toHaveLength(calledTimes);
                });
        };
    };

    it(
        "should trigger private select event when it's enabled",
        runCallbackTest(false, 1)
    );
    it(
        "should not trigger private select event when it's disabled",
        runCallbackTest(true, 0)
    );
});

describe('href attribute', () => {
    it('if not set should have a value of `javascript:void(0)`', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';

        expect(shadowQuerySelector(menuItem, 'a').getAttribute('href')).toBe(
            // eslint-disable-next-line no-script-url
            'javascript:void(0)'
        );
    });

    it('if set should have a value matching the provided content', () => {
        const url = 'https://salesforce.com';
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.href = url;

        return Promise.resolve().then(() => {
            expect(
                shadowQuerySelector(menuItem, 'a').getAttribute('href')
            ).toBe(url);
        });
    });
});

describe('prefix-icon-name attribute', () => {
    it('if not set, or omitted, then no prefix icon should be visible', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';

        return Promise.resolve().then(() => {
            const primitiveIconEl = shadowQuerySelector(
                menuItem,
                'a > .slds-truncate lightning-primitive-icon'
            );

            // if there is an icon validate it is not a prefix icon
            if (primitiveIconEl) {
                const iconEl = shadowQuerySelector(
                    primitiveIconEl,
                    '.slds-icon:not([data-key=check])'
                );
                expect(iconEl).toBeFalsy();
            } else {
                // if there is no icon element
                expect(primitiveIconEl).toBeFalsy();
            }
        });
    });

    it('if set then a prefix icon should be visible', () => {
        const menuItem = createMenuItem();
        menuItem.label = 'test-label';
        menuItem.prefixIconName = 'utility:chat';

        return Promise.resolve().then(() => {
            const lightningIcon = shadowQuerySelector(
                menuItem,
                'a > .slds-truncate lightning-primitive-icon'
            );

            const iconEl = shadowQuerySelector(
                lightningIcon,
                '.slds-icon:not([data-key=check])'
            );
            expect(iconEl).toBeTruthy();
        });
    });
});

describe('is-draft attribute', () => {
    it('if set to false, or omitted, draft marker on button should be hidden', () => {
        const menuItem = createMenuItem();

        const draftMarkerEl = shadowQuerySelector(
            menuItem,
            '.slds-indicator_unsaved'
        );
        expect(draftMarkerEl).toBeNull();
    });

    it('if set to true draft marker on button should be visible', () => {
        const menuItem = createMenuItem();
        menuItem.isDraft = true;

        return Promise.resolve().then(() => {
            const draftMarkerEl = shadowQuerySelector(
                menuItem,
                '.slds-indicator_unsaved'
            );
            expect(menuItem.shadowRoot.contains(draftMarkerEl)).toBeTruthy();
        });
    });

    it('if set to truthy, non-false, value draft marker on button should be visible', () => {
        const menuItem = createMenuItem();
        menuItem.isDraft = 'truthy';

        return Promise.resolve().then(() => {
            const draftMarkerEl = shadowQuerySelector(
                menuItem,
                '.slds-indicator_unsaved'
            );
            expect(menuItem.shadowRoot.contains(draftMarkerEl)).toBeTruthy();
        });
    });

    describe('draft-alternative-text attribute', () => {
        it('if value is NOT set the `title` attribute of the draft marker should not be set', () => {
            const menuItem = createMenuItem();
            menuItem.isDraft = true;

            return Promise.resolve().then(() => {
                const draftMarkerEl = shadowQuerySelector(
                    menuItem,
                    '.slds-indicator_unsaved'
                );
                expect(draftMarkerEl.getAttribute('title')).toBeFalsy();
            });
        });

        it('if value is set the `title` attribute of the draft marker should be set', () => {
            const altText = 'Tab not saved';
            const menuItem = createMenuItem();
            menuItem.isDraft = true;
            menuItem.draftAlternativeText = altText;

            return Promise.resolve().then(() => {
                const draftMarkerEl = shadowQuerySelector(
                    menuItem,
                    '.slds-indicator_unsaved'
                );
                expect(draftMarkerEl.getAttribute('title')).toBe(altText);
            });
        });
    });
});
