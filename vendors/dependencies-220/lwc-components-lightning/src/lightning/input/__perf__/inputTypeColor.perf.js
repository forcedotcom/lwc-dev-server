import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/input';

// eslint-disable-next-line no-undef
measure('inputTypeColor', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const values = ['#FF0000', '#00FF00', '#0000FF'];
    const valuesLength = values.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = 'color';
        element.label = 'My Color';
        element.name = 'myColor';
        element.disabled = !(i % 10);
        element.readOnly = !(i % 7);
        element.required = !(i % 3);
        element.value = values[i % valuesLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.disabled = !!(i % 10);
        element.readOnly = !!(i % 7);
        element.value = values[(i + 1) % valuesLength];
    });

    run('open color pickers', i => {
        if (!(i % 5)) {
            elements[i].shadowRoot
                .querySelector('lightning-primitive-colorpicker-button')
                .shadowRoot.querySelector('button')
                .click();
        }
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
