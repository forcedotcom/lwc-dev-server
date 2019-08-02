import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/dualListbox';
import getStore from './store';

// eslint-disable-next-line no-undef
measure('dual-listbox-with-250-options', 1, benchmark, run, (tag, run) => {
    const elements = [];

    const store = getStore();
    const options = store.options.slice(0, 250);
    const values = store.values.slice(0, 250);

    const createDualListbox = () => {
        const element = createElement(tag, { is: Element });
        element.label = 'Dual Listbox With 250 Options';
        element.sourceLabel = 'Available';
        element.selectedLabel = 'Selected';
        element.options = options;
        return element;
    };

    run('create', i => {
        const element = createDualListbox();
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('select all 250 options', i => {
        elements[i].value = values;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
