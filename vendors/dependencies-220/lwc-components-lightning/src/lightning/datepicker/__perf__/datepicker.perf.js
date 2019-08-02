import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/datepicker';

// eslint-disable-next-line no-undef
measure('datepicker', 10, benchmark, run, (tag, run) => {
    const elements = [];

    const createDatepicker = index => {
        const element = createElement(tag, { is: Element });
        element.label = 'Datepicker';
        element.name = 'datepicker';
        element.min = !(index % 2) ? '2018-01-24' : null;
        element.max = !(index % 2) ? '2020-01-24' : null;
        element.value = !(index % 3) ? '2019-01-24' : null;
        element.disabled = !(index % 5);
        element.required = !(index % 4);
        element.fieldLevelHelp = 'Help text for datepicker';
        return element;
    };

    run('create', i => {
        const element = createDatepicker(i);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = '2019-01-25';
        elements[i].min = '2018-01-25';
        elements[i].max = '2020-01-25';
        elements[i].disabled = !elements[i].disabled;
        elements[i].required = !elements[i].required;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
