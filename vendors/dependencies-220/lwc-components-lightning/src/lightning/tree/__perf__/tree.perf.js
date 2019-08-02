import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/tree';
import Store from './data';

// eslint-disable-next-line no-undef
measure('tree', 5, benchmark, run, (tag, run) => {
    // tree with 10 nodes with 5 levels = 50 nodes
    const store = new Store(10, 5, 1);
    const created = store.data;
    const more = new Store(10, 5, 1).data;
    const collapsed = store.updateData(false).data;
    const expanded = store.updateData(true).data;
    const added = [...created, ...more];

    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.items = created;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('collapse', i => {
        elements[i].items = collapsed;
    });

    run('expand', i => {
        elements[i].items = expanded;
    });

    run('add more', i => {
        // add more 10 nodes with 5 levels = 50 nodes
        elements[i].items = added;
    });

    run('select', i => {
        elements[i].shadowRoot
            .querySelector("lightning-tree-item[role='tree']")
            .shadowRoot.querySelector("lightning-tree-item[data-key='3']")
            .shadowRoot.querySelector('span')
            .click();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
