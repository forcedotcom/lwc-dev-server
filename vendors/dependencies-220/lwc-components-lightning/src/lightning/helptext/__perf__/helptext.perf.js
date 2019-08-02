import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/helptext';

// eslint-disable-next-line no-undef
measure('helptext', 50, benchmark, run, (tag, run) => {
    const elements = [];

    const iconNames = [
        '',
        'utility:add',
        'utility:down',
        'utility:call',
        'utility:case',
    ];
    const iconVariants = ['bare', 'inverse', 'warning', 'error'];
    const iconVariantsLength = iconVariants.length;
    const iconsLength = iconNames.length;
    const content = 'This is helptext with some content';
    const changedContent =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.content = content;
        element.iconName = iconNames[i % iconsLength];
        element.iconVariant = iconNames[i % iconVariantsLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('open', i => {
        elements[i].shadowRoot.querySelector('button').focus();
    });

    run('update content', i => {
        elements[i].iconName = iconNames[iconsLength - 1 - i % iconsLength];
        elements[i].iconVariant =
            iconVariants[iconVariantsLength - 1 - i % iconVariantsLength];
        elements[i].content = changedContent;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
