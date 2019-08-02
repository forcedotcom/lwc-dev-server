import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('input', 50, benchmark, run, (tag, run) => {
    const emails = ['', 'abc@example.com', 'xyz@example.org'];

    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = 'email';

        element.name = `email${i}`;
        element.label = `Email ${i}`;
        element.placeholder = `Enter email ${i} here`;

        element.required = !(i % 2);
        element.disabled = !(i % 5);
        element.readonly = !(i % 7);

        // Leave some of the inputs empty at creation
        if (emails[i % 3] !== '') {
            element.value = emails[i % 3];
        }

        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];

        element.value = emails[(i + 1) % 3];
        element.required = !!(i % 2);
        element.disabled = !!(i % 5);
        element.readonly = !!(i % 7);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
