import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/clickToDial';

// eslint-disable-next-line no-undef
measure('clickToDial', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.value = '15551234567';
        element.recordId = '5003000000D8cuI';
        element.params = 'accountSid=xxx, sourceId=xxx, apiVersion=123';
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
