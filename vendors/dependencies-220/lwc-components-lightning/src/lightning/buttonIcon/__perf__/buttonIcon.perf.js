import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/buttonIcon';

// eslint-disable-next-line no-undef
measure('button-icon', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const variants = [
        'bare',
        'brand',
        'container',
        'border',
        'border-filled',
        'bare-inverse',
        'border-inverse',
    ];
    const variantsLength = variants.length;
    const sizes = ['x-small', 'small', 'medium'];
    const sizesLength = sizes.length;
    const types = ['button', 'reset', 'submit'];
    const typesLength = types.length;
    const ariaExpanded = [true, false];
    const ariaExpandedLength = ariaExpanded.length;
    const ariaLive = ['assertive', 'polite', 'off'];
    const ariaLiveLength = ariaLive.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.size = sizes[i % sizesLength];
        element.iconName = 'action:approval';
        element.variant = variants[i % variantsLength];
        element.alternativeText = 'Click to answer';
        element.selected = !(i % 20);
        element.disabled = !(i % 10);
        element.type = types[i % typesLength];
        element.ariaExpanded = ariaExpanded[i % ariaExpandedLength];
        element.ariaLive = ariaLive[i % ariaLiveLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].focus();
        elements[i].click();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
