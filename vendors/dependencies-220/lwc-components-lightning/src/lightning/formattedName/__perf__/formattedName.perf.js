import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/formattedName';

function generateNames(n) {
    const result = [];
    const formats = ['short', 'medium', 'long'];
    for (let i = 0; i < n; i++) {
        result.push({
            firstName: 'lorem' + i,
            salutation: 'ip' + i,
            lastName: 'sum' + i,
            middleName: 'dolor' + i,
            suffix: 'latin' + i,
            informalName: 'stuff' + i,
            format: formats[i % 3],
        });
    }

    return result;
}

// eslint-disable-next-line no-undef
measure('formattedName', 100, benchmark, run, (tag, run) => {
    const elements = [];
    const values = generateNames(50);
    const valuesLength = values.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        Object.assign(element, values[i]);

        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].format = values[(i + 1) % valuesLength].format;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
