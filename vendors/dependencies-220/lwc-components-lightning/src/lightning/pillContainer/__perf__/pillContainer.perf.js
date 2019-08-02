import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/pillContainer';

// eslint-disable-next-line no-undef
measure('pill-container', 20, benchmark, run, (tag, run) => {
    const elements = [];
    const pill = {
        type: 'none',
        href: '',
        label: 'Avatar Pill',
        src: '/assets/images/avatar2.jpg',
        fallbackIconName: 'standard:user',
        variant: 'circle',
        alternativeText: 'User avatar',
    };

    const pills = (() => {
        const items = [];
        for (let i = 0; i < 30; i++) {
            items.push(Object.assign({}, pill));
        }
        return items;
    })();

    const updated = pills.slice(0, 15);

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.items = pills;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].items = updated;
        elements[i].focus();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
