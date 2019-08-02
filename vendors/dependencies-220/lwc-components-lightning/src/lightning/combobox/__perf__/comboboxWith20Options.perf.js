import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/combobox';
import getStore from './store';

// eslint-disable-next-line no-undef
measure('combobox-with-20-options', 6, benchmark, run, (tag, run) => {
    const elements = [];

    const store = getStore();
    const options = store.options.slice(0, 20);
    const values = store.values.slice(0, 20);
    const moreOptions = store.options.slice(0, 270);

    const createCombobox = index => {
        const element = createElement(tag, { is: Element });
        element.label = 'Combobox With 20 Options';
        element.fieldLevelHelp = 'Help text for combobox';
        element.options = options;
        element.disabled = !(index % 3);
        element.required = !(index % 2);
        element.dropdownAlignment = !(index % 2) ? 'right' : 'bottom-left';
        element.spinnerActive = !(index % 2);
        return element;
    };

    run('create', i => {
        const element = createCombobox(i);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('add 250 options', i => {
        elements[i].options = moreOptions;
    });

    run('select one of 20 options', i => {
        elements[i].value = values[10];
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
