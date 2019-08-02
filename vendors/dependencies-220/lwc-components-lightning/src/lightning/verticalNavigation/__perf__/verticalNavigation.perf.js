import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';
import {
    generateOverflows,
    generateSections,
} from './verticalNavigation-perf-utils';

// eslint-disable-next-line no-undef
measure('verticalNavigation', 1, benchmark, run, (tag, run) => {
    const elements = [];
    const sections = generateSections(5, 5);
    const overflows = generateOverflows(5, 5);

    run('create', i => {
        const element = createElement(tag, { is: Container });
        element.sections = sections;
        element.overflows = overflows;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('select item', i => {
        elements[i].selectedItem = 'item1';
    });

    run('toggle overflow', i => {
        elements[i].clickFirstOverflow();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
