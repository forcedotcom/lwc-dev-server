import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputTypeTel', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const values = ['413-594-2521', '932-234-2934', '305-213-9238'];
    const valuesLength = values.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = 'tel';
        element.label = 'Telephone lbl' + i;
        element.name = 'tel' + i;
        element.disabled = !(i % 3);
        element.readOnly = !(i % 3);
        element.required = !(i % 3);
        element.value = values[i % valuesLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.disabled = !!(i % 3);
        element.readOnly = !!(i % 3);
        element.value = values[(i + 1) % valuesLength];
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
