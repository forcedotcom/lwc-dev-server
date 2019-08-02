import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';

// eslint-disable-next-line no-undef
measure('card', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const cards = [
        {
            title: 'Card Title',
            iconName: 'utility:down',
            variant: 'narrow',
        },
        {
            title: 'Event Card',
            iconName: 'standard:event',
            variant: 'base',
        },
        {
            title: 'Error Card',
            iconName: 'utility:error',
            variant: 'narrow',
        },
    ];

    run('create', i => {
        const container = createElement(tag, { is: Container });
        Object.assign(container, cards[i % 3]);
        elements[i] = container;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
