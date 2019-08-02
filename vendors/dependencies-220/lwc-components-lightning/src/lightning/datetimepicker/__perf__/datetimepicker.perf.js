import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/datetimepicker';

// eslint-disable-next-line no-undef
measure('datetimepicker', 10, benchmark, run, (tag, run) => {
    const elements = [];

    const createDateTimepicker = index => {
        const element = createElement(tag, { is: Element });
        element.label = 'Date Time picker';
        element.name = 'datetimepicker';
        element.min = !(index % 2) ? '2018-01-24T18:13:41Z' : null;
        element.max = !(index % 2) ? '2020-01-24T18:13:41Z' : null;
        element.value = !(index % 3) ? '2019-01-24T18:13:41Z' : null;
        element.disabled = !(index % 5);
        element.required = !(index % 4);
        element.fieldLevelHelp = 'Help text for datetime picker';
        return element;
    };

    run('create', i => {
        const element = createDateTimepicker(i);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = '2019-01-25T19:13:41Z';
        elements[i].min = '2018-01-25T19:13:41Z';
        elements[i].max = '2020-01-25T19:13:41Z';
        elements[i].disabled = !elements[i].disabled;
        elements[i].required = !elements[i].required;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
