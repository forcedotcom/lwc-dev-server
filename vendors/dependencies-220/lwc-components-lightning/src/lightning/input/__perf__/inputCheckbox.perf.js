import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputCheckbox', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.name = `input${i}`;
        element.label = `Input ${i}`;
        element.type = `checkbox`;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].checked = true;
    });

    run('validity', i => {
        elements[i].required = true;
        elements[i].checked = false;
        elements[i].showHelpMessageIfInvalid();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
