import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/breadcrumb';

// eslint-disable-next-line no-undef
measure('breadcrumb', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const label = 'My Breadcrumb';
    const updatedLabel = 'My Updated Breadcrumb';
    const href = 'www.google.com';
    const updatedHref = 'www.salesforce.com';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        if (i % 2) {
            element.href = href;
        }
        element.label = label;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].label = updatedLabel;
        elements[i].href = updatedHref;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
