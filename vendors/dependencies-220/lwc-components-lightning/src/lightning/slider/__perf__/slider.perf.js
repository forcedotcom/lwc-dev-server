import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/slider';

// eslint-disable-next-line no-undef
measure('slider', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const variants = ['standard', 'label-hidden'];
    const variantsLength = variants.length;
    const sizes = ['x-small', 'small', 'medium', 'large'];
    const sizesLength = sizes.length;
    const types = ['range', 'text', 'horizontal', 'vertical'];
    const typesLength = types.length;
    const steps = [0.1, 1, 10];
    const stepsLength = steps.length;
    const label = ['My Label', ''];
    const labelLength = label.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.variant = variants[i % variantsLength];
        element.size = sizes[i % sizesLength];
        element.type = types[i % typesLength];
        element.disabled = !(i % 10);
        element.step = steps[i % stepsLength];
        element.label = label[i % labelLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].value = 50;
        elements[i].disabled = !(i % 5);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
