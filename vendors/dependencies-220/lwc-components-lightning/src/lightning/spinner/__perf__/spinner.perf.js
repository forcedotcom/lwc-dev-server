import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/spinner';

// eslint-disable-next-line no-undef
measure('spinner', 50, benchmark, run, (tag, run) => {
    const elements = [];

    const sizes = ['small', 'medium', 'large'];
    const variants = ['base', 'brand', 'inverse'];
    const variantsLength = variants.length;
    const sizesLength = sizes.length;
    const alternativeText = 'Loading';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.size = sizes[i % sizesLength];
        element.variant = variants[i % variantsLength];
        element.alternativeText = alternativeText;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].size = sizes[sizesLength - 1 - i % sizesLength];
        elements[i].variant = variants[variantsLength - 1 - i % variantsLength];
        elements[i].alternativeText = `${alternativeText}${alternativeText}`;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
