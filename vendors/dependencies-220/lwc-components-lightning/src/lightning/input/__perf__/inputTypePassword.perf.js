import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputTypePassword', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const value = 'myPassword2000';
    const updatedValue = 'myNewPassword3000';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = 'password';
        element.label = 'Password';
        element.placeholder = 'Enter Password';
        element.name = 'pwd';
        element.required = !(i % 3);
        element.disabled = !(i % 5);
        element.readOnly = !(i % 10);
        if (i % 2) {
            element.value = value;
        }
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.disabled = !!(i % 5);
        element.readOnly = !!(i % 10);
        element.value = !(i % 2) ? updatedValue : '';
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
