import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';

// eslint-disable-next-line no-undef
measure('pill', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const pills = [
        {
            label: 'Pill Plain',
            variant: 'plain',
            href: '/path/to/somewhere',
        },
        {
            label: 'Pill Plain',
            variant: 'link',
            href: '/path/to/anywhere',
            error: true,
        },
        {
            label: 'Pill Plain',
            variant: 'link',
            error: false,
        },
        {
            label: 'Pill Plain',
            variant: 'link',
            href: '/path/to/anywhere',
            error: false,
        },
    ];

    run('create', i => {
        const container = createElement(tag, { is: Container });
        Object.assign(container, pills[i % pills.length]);
        elements[i] = container;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].focus();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
