import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';

// eslint-disable-next-line no-undef
measure('carousel', 10, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Container });
        element.disableAutoRefresh = !(i % 2);
        element.disableAutoScroll = !(i % 2);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('flip scrolling', i => {
        elements[i].disableAutoScroll = !elements[i].disableAutoScroll;
    });

    run('add children', i => {
        elements[i].moreItems = true;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
