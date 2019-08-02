import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputTypeRadio', 100, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });

        element.type = 'radio';
        element.name = `radio${i}`;
        element.label = `Radio ${i}`;
        element.value = `radio${i}`;
        element.checked = !(i % 2);

        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('change value', i => {
        elements[i].checked = !!(i % 2);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
