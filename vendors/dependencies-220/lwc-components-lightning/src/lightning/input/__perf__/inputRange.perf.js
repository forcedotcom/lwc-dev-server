import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputRange', 50, benchmark, run, (tag, run) => {
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

    run('update', i => {
        elements[i].min = 1;
        elements[i].max = 100;
        elements[i].value = i % 50;
    });

    run('validity', i => {
        elements[i].min = 1;
        elements[i].max = 100;
        elements[i].value = 101;
        elements[i].showHelpMessageIfInvalid();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
