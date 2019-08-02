import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/textarea';

// eslint-disable-next-line no-undef
measure('textarea', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const initialValue = 'Initial Value';
    const placeholder = 'Placeholder';
    const label = 'My Label';
    const newValue =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.label = label;
        if (i % 2) {
            element.placeholder = placeholder;
        }
        if (i % 3) {
            element.initialValue = initialValue;
        }
        if (i % 5) {
            element.required = true;
        }
        if (i % 7) {
            element.disabled = true;
        }
        if (i % 11) {
            element.readonly = true;
        }
        if (i % 13) {
            element.variant = 'label-hidden';
        }
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = newValue;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
