import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/radioGroup';

// eslint-disable-next-line no-undef
measure('radioGroup', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const types = ['radio', 'button'];
    const typesLength = types.length;
    const options = [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
        { label: 'Five', value: '5' },
        { label: 'Six', value: '6' },
        { label: 'Seven', value: '7' },
        { label: 'Eight', value: '8' },
        { label: 'Nine', value: '9' },
        { label: 'Ten', value: '10' },
    ];
    const optionsLength = options.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = types[i % typesLength];
        element.label = 'My Radio Group';
        element.options = options;
        element.disabled = !(i % 10);
        element.required = !(i % 3);
        element.value = options[i % optionsLength].value;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.disabled = !!(i % 10);
        element.value = options[(i + 1) % optionsLength].value;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
