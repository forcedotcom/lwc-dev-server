import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/progressBar';

// eslint-disable-next-line no-undef
measure('progressBar', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const variants = ['base', 'circular'];
    const variantsLength = variants.length;
    const sizes = ['x-small', 'small', 'medium', 'large'];
    const sizesLength = sizes.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.variant = variants[i % variantsLength];
        element.size = sizes[i % sizesLength];
        element.value = i;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = i + 1;
        elements[i].size = sizes[(i + 1) % sizesLength];
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
