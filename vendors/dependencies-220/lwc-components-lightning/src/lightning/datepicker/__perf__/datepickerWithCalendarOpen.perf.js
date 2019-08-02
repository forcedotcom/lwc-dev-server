import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/datepicker';

// eslint-disable-next-line no-undef
measure('datepicker-with-calendar-open', 1, benchmark, run, (tag, run) => {
    const elements = [];

    const createDatepicker = () => {
        const element = createElement(tag, { is: Element });
        element.label = 'Datepicker';
        element.min = '2019-01-10';
        element.max = '2022-02-10';
        element.value = '2019-01-20';
        return element;
    };

    run('create and append', i => {
        const element = createDatepicker();
        main.appendChild(element);

        elements[i] = element;
    });

    run('open calendar', i => {
        elements[i].shadowRoot.querySelector('input').click();
    });

    run('go to previous month', i => {
        elements[i].shadowRoot
            .querySelector('lightning-calendar')
            .shadowRoot.querySelector('lightning-button-icon')
            .click();
    });

    run('select today', i => {
        elements[i].shadowRoot
            .querySelector('lightning-calendar')
            .shadowRoot.querySelector('button[name=today]')
            .click();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
