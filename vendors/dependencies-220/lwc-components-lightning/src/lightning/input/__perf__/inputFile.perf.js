import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputFile', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.name = `input${i}`;
        element.label = `Input ${i}`;
        element.type = `range`;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('change value', i => {
        elements[i].accept = 'image/jpg';
        elements[i].multiple = true;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
