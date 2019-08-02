import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/buttonIconStateful';

// eslint-disable-next-line no-undef
measure('button-icon-stateful', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const defaultValue = {
        iconName: 'utility:like',
        selected: true,
        alternativeText: 'Like',
        size: 'x-small',
        variant: 'border-filled',
    };

    run('create', i => {
        const element = createElement(tag, { is: Element });
        Object.assign(element, defaultValue);
        element.selected = !(1 % 2);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].selected = !!(i % 2);
        elements[i].focus();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
