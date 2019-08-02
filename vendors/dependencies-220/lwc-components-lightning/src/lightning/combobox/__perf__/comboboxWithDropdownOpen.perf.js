import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/combobox';
import getStore from './store';

// eslint-disable-next-line no-undef
measure('combobox-with-dropdown-open', 1, benchmark, run, (tag, run) => {
    const comboboxWith20Options = [];
    const comboboxWith250Options = [];
    const store = getStore();

    const createCombobox = numOptions => {
        const element = createElement(tag, { is: Element });
        element.label = 'Combobox Example Component';
        element.options = store.options.slice(0, numOptions);
        return element;
    };

    run('create and append combobox with 20 options', i => {
        const element = createCombobox(20);
        main.appendChild(element);

        comboboxWith20Options[i] = element;
    });

    run('create and append combobox with 250 options', i => {
        const element = createCombobox(250);
        main.appendChild(element);

        comboboxWith250Options[i] = element;
    });

    run('open combobox with 20 options', i => {
        comboboxWith20Options[i].shadowRoot
            .querySelector('lightning-base-combobox')
            .shadowRoot.querySelector('input')
            .click();
    });

    run('open combobox with 250 options', i => {
        comboboxWith250Options[i].shadowRoot
            .querySelector('lightning-base-combobox')
            .shadowRoot.querySelector('input')
            .click();
    });

    run('remove combobox with 20 options', i => {
        main.removeChild(comboboxWith20Options[i]);
    });

    run('remove combobox with 250 options', i => {
        main.removeChild(comboboxWith250Options[i]);
    });
});
