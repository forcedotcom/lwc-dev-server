import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/formattedTime';

// eslint-disable-next-line no-undef
measure('formattedTime', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const value = '22:12:30.999Z';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        elements[i] = element;
        element.value = value;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = '10:10:10Z';
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
