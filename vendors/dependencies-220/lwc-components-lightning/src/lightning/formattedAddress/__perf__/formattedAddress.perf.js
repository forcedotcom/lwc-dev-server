import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/formattedAddress';

function generateAddresses(n) {
    // not using the showStaticMap since it includes the google map
    const result = [];
    const validLatLng = [
        '40.6177',
        '2.3750',
        '87.2405',
        '18.5945',
        '75.7263',
        '56.2151',
        '81.6897',
        '12.0677',
        '53.6956',
        '65.7756',
    ];
    const streets = [
        '717 Battery St',
        '423 Spear St',
        '7895 Landmark st',
        '467 California pl',
    ];
    const cities = ['Los Angeles', 'La Habana', 'Washington'];
    const provinces = ['Florida', 'California', 'Pensilvania'];

    let partialResult;

    for (let i = 0; i < n; i++) {
        if (i % 2 === 0) {
            // use lat/lng
            partialResult = {
                latitude: validLatLng[i % validLatLng.length],
                longitude: validLatLng[(i + 1) % validLatLng.length],
            };
        } else {
            partialResult = {
                street: streets[i % streets.length] + i,
                city: cities[i + cities.length] + i,
                province: provinces[i % provinces.length] + i,
                country: 'United States' + i,
                postalCode: '5772' + i,
            };
        }

        partialResult.disabled = i % 3 === 0;

        result.push(partialResult);
    }

    return result;
}

// eslint-disable-next-line no-undef
measure('formattedAddress', 100, benchmark, run, (tag, run) => {
    const elements = [];
    const values = generateAddresses(100);

    run('create', i => {
        const element = createElement(tag, { is: Element });
        Object.assign(element, values[i]);

        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        const element = elements[i];
        const newAddress = values[(i + 2) % 2];

        if (i % 2 === 0) {
            element.latitude = newAddress.latitude;
            element.longitude = newAddress.longitude;
        } else {
            element.street = newAddress.street;
            element.city = newAddress.city;
            element.province = newAddress.province;
        }

        element.disabled = !element.disabled;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
