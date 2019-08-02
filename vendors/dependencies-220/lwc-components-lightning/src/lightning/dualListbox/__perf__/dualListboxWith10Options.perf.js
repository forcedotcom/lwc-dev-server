import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/dualListbox';
import getStore from './store';

// eslint-disable-next-line no-undef
measure('dual-listbox-with-10-options', 5, benchmark, run, (tag, run) => {
    const elements = [];

    const store = getStore();
    const options = store.options.slice(0, 10);
    const values = store.values.slice(0, 10);
    const moreOptions = store.options.slice(0, 110);

    const createDualListbox = index => {
        const element = createElement(tag, { is: Element });
        element.label = 'Dual Listbox With 10 Options';
        element.sourceLabel = 'Available';
        element.selectedLabel = 'Selected';
        element.fieldLevelHelp = 'Help text for dual-list-box';
        element.options = options;
        element.disabled = !(index % 3);
        element.required = !(index % 2);
        element.disableReordering = !(index % 3);
        element.showActivityIndicator = !(index % 2);
        return element;
    };

    run('create', i => {
        const element = createDualListbox(i);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('add 100 options', i => {
        elements[i].options = moreOptions;
    });

    run('select all 10 options', i => {
        elements[i].value = values;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
