import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Container from './container/container';

// eslint-disable-next-line no-undef
measure('button-group', 20, benchmark, run, (tag, run) => {
    const elements = [];
    const button = {
        label: 'Button In Group',
        iconName: 'standard:user',
        variant: 'inverse',
    };

    const buttons = (() => {
        const items = [];
        for (let i = 0; i < 30; i++) {
            const item = Object.assign({}, button);
            item.index = i;
            items.push(item);
        }
        return items;
    })();

    const updated = buttons.slice(0, 10);

    run('create', i => {
        const container = createElement(tag, { is: Container });
        container.items = buttons;
        elements[i] = container;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update - remove 10 buttons', i => {
        elements[i].items = elements[i].items.slice(0, 20);
        elements[i].focus();
    });

    run('update - add 10 buttons', i => {
        elements[i].items = elements[i].items.concat(updated);
        elements[i].focus();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
