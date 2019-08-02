import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';
import { generateLayouts, updateLayoutElement } from './layout-perf-utils';

// eslint-disable-next-line no-undef
measure('layout-4-with-10-items', 4, benchmark, run, (tag, run) => {
    const elements = [];
    const layouts = generateLayouts(4, 10);

    run('create', i => {
        const container = createElement(tag, { is: Container });
        Object.assign(container, layouts[i]);
        elements[i] = container;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        updateLayoutElement(elements[i], i);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
