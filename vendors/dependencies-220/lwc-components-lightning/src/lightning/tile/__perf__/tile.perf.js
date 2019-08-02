import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';

// eslint-disable-next-line no-undef
measure('tile', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const attributes = [
        {
            label: 'Standard Tile',
            href: '/path/to/somewhere',
        },
        {
            label: 'Media Tile',
            type: 'media',
            href: '/path/to/somewhere',
        },
    ];

    run('create', i => {
        const container = createElement(tag, { is: Container });
        Object.assign(container, attributes[i % 2 ? 0 : 1]);
        elements[i] = container;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].hideContent = true;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
