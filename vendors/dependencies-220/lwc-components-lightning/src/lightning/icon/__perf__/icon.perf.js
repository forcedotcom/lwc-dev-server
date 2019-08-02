import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/icon';
import { actions } from './data';

// eslint-disable-next-line no-undef
measure('icon', 100, benchmark, run, (tag, run) => {
    const elements = [];
    const sizes = ['xx-small', 'x-small', 'small', 'medium', 'large'];
    const sizesLength = sizes.length;
    const variants = ['inverse', 'warning', 'error'];
    const variantsLength = variants.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.size = sizes[i % sizesLength];
        element.variants = variants[i % variantsLength];
        element.alternativeText = 'Alternative Text';
        element.iconName = `action:${actions[i]}`;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
