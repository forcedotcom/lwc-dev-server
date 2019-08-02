import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';
import { icons, getItems } from './data';

const sizes = ['xx-small', 'x-small', 'medium', 'large'];
const sizesLength = sizes.length;
const variants = [
    'bare',
    'container',
    'border',
    'border-filled',
    'bare-inverse',
    'border-inverse',
];
const aligns = [
    'auto',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
];
const alignmentLength = aligns.length;
const variantsLength = variants.length;
const iconsLength = icons.length;
const label = 'Menu';

// eslint-disable-next-line no-undef
measure('button-menu-60-options', 5, benchmark, run, (tag, run) => {
    const elements = [];
    const items = getItems(60);

    run('create menu with 60 options', i => {
        const element = createElement(tag, { is: Container });
        element.variant = variants[i % variantsLength];
        element.iconName = icons[i % iconsLength];
        element.iconSize = sizes[i % sizesLength];
        element.menuAlignment = aligns[i % alignmentLength];
        element.label = label;

        if (i % 2) {
            element.label = '';
        }
        if (i % 5) {
            element.isDraft = true;
            element.showMenuDivider = true;
            element.showSubheader = true;
        }

        element.privateMenuItems = [...items];
        elements[i] = element;
    });

    run('append menu with 60 options', i => {
        main.appendChild(elements[i]);
    });

    run('open menu with 60 options', i => {
        elements[i].shadowRoot
            .querySelector('.button-menu-perf')
            .shadowRoot.querySelector('button')
            .click();
    });

    run('remove menu with 60 options', i => {
        main.removeChild(elements[i]);
    });
});
