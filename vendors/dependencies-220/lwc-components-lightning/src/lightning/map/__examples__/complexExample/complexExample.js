import { LightningElement } from 'lwc';

export default class LightningExampleMapComplexExample extends LightningElement {
    mapMarkers = [
        {
            location: {
                Street: '1 Market St',
                City: 'San Francisco',
                PostalCode: '94105',
                State: 'CA',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'Worldwide Corporate Headquarters',
            description: 'Sales: 1800-NO-SOFTWARE',
        },
        {
            location: {
                Street: '950 East Paces Ferry Road NE',
                City: 'Atlanta',
                PostalCode: '94105',
                State: 'GA',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Atlanta',
        },
        {
            location: {
                Street: '929 108th Ave NE',
                City: 'Bellevue',
                PostalCode: '98004',
                State: 'WA',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Bellevue',
        },
        {
            location: {
                Street: '500 Boylston Street 19th Floor',
                City: 'Boston',
                PostalCode: '02116',
                State: 'MA',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Boston',
        },
        {
            location: {
                Street: '111 West Illinois Street',
                City: 'Chicago',
                PostalCode: '60654',
                State: 'IL',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Chicago',
        },
        {
            location: {
                Street: '2550 Wasser Terrace',
                City: 'Herndon',
                PostalCode: '20171',
                State: 'VA',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Herndon',
        },
        {
            location: {
                Street: '111 Monument Circle',
                City: 'Indianapolis',
                PostalCode: '46204',
                State: 'IN',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Indy',
        },
        {
            location: {
                Street: '361 Centennial Parkway',
                City: 'Louisville',
                PostalCode: '80027',
                State: 'CO',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc Louisville',
        },
        {
            location: {
                Street: '685 Third Ave',
                City: 'New York',
                PostalCode: '10017',
                State: 'NY',
                Country: 'USA',
            },

            icon: 'utility:salesforce1',
            title: 'salesforce.com inc New York',
        },
    ];

    center = {
        location: {
            City: 'Denver',
        },
    };

    zoomLevel = 4;
    markersTitle = 'Salesforce locations in United States';
    showFooter = true;
    listView = 'visible';
}
