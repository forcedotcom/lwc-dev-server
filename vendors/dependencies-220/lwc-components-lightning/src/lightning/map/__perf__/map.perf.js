import { measure, main } from '../../../perf';
import { createElement } from 'lwc';
import Element from 'lightning/map';

// eslint-disable-next-line no-undef
measure('map', 10, benchmark, run, (tag, run) => {
    const elements = [];
    const markers = [
        'Salesforce Tower, Tallest building on the West Coast, standard:account,,, 415 Mission St, San Francisco, CA, 94105, USA',
        'Salesforce Bellevue,, utility:chevronright,,, 929 108th Ave NE, Bellevue, WA, 98004, USA',
        'Salesforce Toronto, Canada offices,, 43.641242, -79.377327,,,,,',
        'Salesforce Chicago,,,,, 111 West Illinois St, Chicago, IL, 60654, USA',
        'Salesforce Atlanta,,,,, 950 East Paces Ferry Road NE, Atlanta, GA, 30326, USA',
    ].map(csv => {
        const data = csv.split(/\s*,\s*/g);
        const [
            title,
            description,
            icon,
            Latitude,
            Longitude,
            Street,
            City,
            State,
            PostalCode,
            Country,
        ] = data;
        return {
            title,
            description,
            icon,
            location: Latitude
                ? { Latitude, Longitude }
                : { Street, City, State, PostalCode, Country },
        };
    });
    const markersLength = markers.length;
    const showFooter = [true, false];
    const showFooterLength = showFooter.length;
    const markersTitle = 'This is a title';
    const zoomLevel = 5;
    const listView = ['auto', 'visible', 'hidden'];
    const listViewLength = listView.length;
    const updatedMarkers = markers.slice(1, 3);

    run('create', i => {
        const element = createElement(tag, { is: Element });
        element.showFooter = showFooter[i % showFooterLength];
        if (i % 2) {
            element.zoomLevel = zoomLevel;
            element.mapMarkers = markers; // multi markers mode
            element.markersTitle = markersTitle;
        } else {
            element.mapMarkers = [markers[i % markersLength]]; // single marker mode
        }
        element.listView = listView[i % listViewLength];
        elements[i] = element;
    });

    run('append', i => {
        main.appendChild(elements[i]);
    });

    run('update', i => {
        elements[i].mapMarkers = updatedMarkers;
    });

    run('remove', i => {
        main.removeChild(elements[i]);
    });
});
