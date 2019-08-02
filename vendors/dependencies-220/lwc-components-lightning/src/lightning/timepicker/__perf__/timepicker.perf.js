import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/timepicker';

// eslint-disable-next-line no-undef
measure('timepicker', 10, benchmark, run, (tag, run) => {
    const elements = [];

    const createTimepicker = index => {
        const element = createElement(tag, { is: Element });
        element.label = 'Timepicker';
        element.name = 'timepicker';
        element.min = !(index % 2) ? '08:13:41.000' : null;
        element.max = !(index % 2) ? '15:13:41.000' : null;
        element.value = !(index % 3) ? '08:35:00.000' : null;
        element.disabled = !(index % 5);
        element.required = !(index % 4);
        element.fieldLevelHelp = 'Help text for timepicker';
        return element;
    };

    run('create', i => {
        const element = createTimepicker(i);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = '09:35:00.000';
        elements[i].min = '09:13:41.000';
        elements[i].max = '14:13:41.000';
        elements[i].disabled = !elements[i].disabled;
        elements[i].required = !elements[i].required;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
