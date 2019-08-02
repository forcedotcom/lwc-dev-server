import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/avatar';

// eslint-disable-next-line no-undef
measure('avatar', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const variants = ['empty', 'circle', 'square'];
    const variantsLength = variants.length;
    const initials = ['MB', ''];
    const initialsLength = initials.length;
    const sizes = ['x-small', 'small', 'medium', 'large'];
    const sizesLength = sizes.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.initials = initials[i % initialsLength];
        element.fallbackIconName = 'standard:person_account';
        element.alternativeText = 'Mark Bench';
        element.variant = variants[i % variantsLength];
        element.size = sizes[i % sizesLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
