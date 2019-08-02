import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputTypeSearch', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const values = ['foo', 'bar', 'baz'];
    const valuesLength = values.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = 'search';
        element.label = 'My Search';
        element.name = 'mySearch';
        element.disabled = !(i % 10);
        element.readOnly = !(i % 7);
        element.required = !(i % 3);
        element.isLoading = !(i % 2);
        element.value = values[i % valuesLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.disabled = !!(i % 10);
        element.readOnly = !!(i % 7);
        element.isLoading = !!(i % 2);
        element.value = values[(i + 1) % valuesLength];
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
