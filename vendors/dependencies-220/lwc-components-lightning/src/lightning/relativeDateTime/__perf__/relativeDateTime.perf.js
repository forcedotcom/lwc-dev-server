import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/relativeDateTime';

// The underlying library used by this component is in aura. Once is migrated to lwc the numbers here will be more accurate

// eslint-disable-next-line no-undef
measure('relativeDateTime', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.value = Date.now();

        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
