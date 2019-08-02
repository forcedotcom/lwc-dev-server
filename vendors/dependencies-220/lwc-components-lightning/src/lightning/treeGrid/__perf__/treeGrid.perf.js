import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/treeGrid';
import Store from './data';

// eslint-disable-next-line no-undef
measure('treeGrid', 1, benchmark, run, (tag, run) => {
    const created = new Store(20, 10, 1).data;
    const more = new Store(10, 10, 1).data;
    const added = [...created, ...more];
    const dtStore = new Store();
    const initialExpanded = [
        ...dtStore.getExpanded(1, 10),
        ...dtStore.getExpanded(21, 110),
    ];
    const newExpanded = [
        ...dtStore.getExpanded(11, 15),
        ...dtStore.getExpanded(111, 155),
    ];
    const addedExpanded = [
        ...dtStore.getExpanded(201, 205),
        ...dtStore.getExpanded(211, 255),
    ];

    const columns = [
        { label: 'Account', fieldName: 'accountName', type: 'text' },
        { label: 'Phone', fieldName: 'phone', type: 'phone' },
        { label: 'Website', fieldName: 'url', type: 'url' },
        { label: 'Created', fieldName: 'created', type: 'datetime' },
        { label: 'Billing State', fieldName: 'state', type: 'text' },
    ];

    const elements = [];

    run('create', i => {
        // 115 rows
        const element = createElement(tag, { is: Element });
        element.keyField = 'id';
        element.columns = columns;
        // expand first 10 rows and their children = 100 rows + 10 rows
        element.expandedRows = initialExpanded;
        element.data = created;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('expand rows', i => {
        // expand next 5 rows and their children in update
        const expanded = elements[i].getCurrentExpandedRows();
        elements[i].expandedRows = [...expanded, ...newExpanded];
    });

    run('add 50 rows', i => {
        // add 5 rows with expanded children for 5 = 50
        elements[i].data = added;

        const expanded = elements[i].getCurrentExpandedRows();
        elements[i].expandedRows = [...expanded, ...addedExpanded];
    });

    run('expand all', i => {
        elements[i].expandAll();
    });

    run('collapse all', i => {
        elements[i].collapseAll();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
