import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/inputLocation';

// eslint-disable-next-line no-undef
measure('inputLocation', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const variants = ['standard', 'label-hidden'];
    const variantsLength = variants.length;
    const latitudes = [-90, 0, 90];
    const latitudesLength = latitudes.length;
    const longitudes = [-180, 0, 180];
    const longitudesLength = longitudes.length;

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.label = 'My Location';
        element.fieldLevelHelp =
            i % 3 ? 'Enter your current location' : undefined;
        element.latitude = latitudes[i % latitudesLength];
        element.longitude = longitudes[i % longitudesLength];
        element.disabled = !(i % 10);
        element.readOnly = !(i % 7);
        element.required = !(i % 3);
        element.variant = variants[i % variantsLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        element.latitude = latitudes[(i + 1) % latitudesLength];
        element.longitude = longitudes[(i + 1) % longitudesLength];
        element.disabled = !!(i % 10);
        element.readOnly = !!(i % 7);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
