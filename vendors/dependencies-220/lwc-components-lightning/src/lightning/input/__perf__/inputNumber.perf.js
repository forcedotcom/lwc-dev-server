import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

const formats = ['decimal', 'percent', 'percent-fixed', 'currency'];

// eslint-disable-next-line no-undef
measure('inputNumber', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.name = `input${i}`;
        element.label = `Input ${i}`;
        element.type = `number`;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = 50;
    });

    run('update format', i => {
        elements[i].formatter = formats[i % formats.length];
        elements[i].step = 0.01;
        elements[i].value = 50.01;
    });

    run('validity', i => {
        elements[i].value = 'Wrong number';
        elements[i].showHelpMessageIfInvalid();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
