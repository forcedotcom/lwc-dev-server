import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/inputAddress';

const defaultAttributes = {
    addressLabel: 'Address',
    streetLabel: 'Street',
    cityLabel: 'City',
    countryLabel: 'Country',
    provinceLabel: 'Province/State',
    postalCodeLabel: 'Zip/Postal Code',
};

const exampleAddressValues = {
    street: '121 Spear St.',
    city: 'San Francisco',
    country: 'US',
    province: 'CA',
    postalCode: '94105',
};

// Object.assign doesn't work, fix
function assign(element, object) {
    Object.keys(object).forEach(key => {
        element[key] = object[key];
    });
}

// Object.assign doesn't work, fix
function assignEmpty(element, object) {
    Object.keys(object).forEach(key => {
        element[key] = '';
    });
}

// eslint-disable-next-line no-undef
measure('inputAddress', 50, benchmark, run, (tag, run) => {
    const elements = [];

    run('create', i => {
        const element = createElement(tag, { is: Element });
        assign(element, defaultAttributes);
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        assign(elements[i], exampleAddressValues);
    });

    run('validity', i => {
        elements[i].required = true;
        assignEmpty(elements[i], exampleAddressValues);
        elements[i].showHelpMessageIfInvalid();
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
