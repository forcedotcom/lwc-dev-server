import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/dynamicIcon';

// eslint-disable-next-line no-undef
measure('dynamicIcon', 50, benchmark, run, (tag, run) => {
    const elements = [];
    const typesandoptions = {
        ellie: [],
        eq: ['play', 'stop'],
        score: ['positive', 'negative'],
        strength: [-3, -2, -1, 0, 1, 2, 3],
        trend: ['neutral', 'up', 'down'],
        waffle: [],
    };
    const types = Object.getOwnPropertyNames(typesandoptions);
    const typesLength = types.length;
    const alternativeText = 'Alternative Text!';

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.type = types[i % typesLength];
        const optionsLength = typesandoptions[element.type].length;
        element.option = typesandoptions[element.type][i % optionsLength];
        element.alternativeText = alternativeText;
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
