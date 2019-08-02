/**
 * Default settings values
 */
export const KEYFIELD = 'name';

/**
 * Columns definition
 * :: valid basic version
 */
export const COLUMNS_DEFINITION_BASIC = [
    {
        type: 'text',
        fieldName: 'accountName',
        label: 'Account Name',
    },
    {
        type: 'phone',
        fieldName: 'phone',
        label: 'Phone Number',
    },
];

/**
 * Columns definition
 * :: with non-whitelisted column keys
 */
export const COLUMNS_DEFINITION_NONWHITELIST = [
    {
        type: 'text',
        fieldName: 'accountName',
        label: 'Account Name',
    },
    {
        type: 'phone',
        fieldName: 'phone',
        label: 'Phone Number',
        sortable: true,
    },
];

/**
 * Columns definition
 * :: used in examples
 */
export const EXAMPLES_COLUMNS_DEFINITION_BASIC = [
    {
        type: 'text',
        fieldName: 'accountName',
        label: 'Account Name',
        initialWidth: 300,
    },
    {
        type: 'number',
        fieldName: 'employees',
        label: 'Employees',
    },
    {
        type: 'phone',
        fieldName: 'phone',
        label: 'Phone Number',
    },
    {
        type: 'url',
        fieldName: 'accountOwner',
        label: 'Account Owner',
        typeAttributes: {
            label: { fieldName: 'accountOwnerName' },
        },
    },
    {
        type: 'text',
        fieldName: 'billingCity',
        label: 'Billing City',
    },
];

/**
 * Sample expanded rows
 * :: valid basic version, no invalid row IDs
 */
export const EXPANDED_ROWS_BASIC = ['584996-s7', '377526-zg'];

/**
 * Sample expanded rows including some without children content
 * :: valid basic version, no invalid row IDs
 */
export const EXPANDED_ROWS_MISSING_CHILDREN_CONTENT = [
    '584996-s7',
    '377526-zg',
    '816682-xr',
];

/**
 * Sample expanded rows
 * :: with invalid row IDs
 */
export const EXPANDED_ROWS_INVALID = [
    '584996-s7',
    '377526-zg',
    'AWEFUL-bad_iD',
    '882894-s3',
    'PiCkLeS',
    '31337-ID',
];

/**
 * Sample selected rows
 * :: valid basic version, no invalid row IDs
 */
export const SELECTED_ROWS_BASIC = ['125313-7j', '584996-s7'];

/**
 * Sample selected rows
 * :: with invalid row IDs
 */
export const SELECTED_ROWS_INVALID = [
    '584996-s7',
    '377526-zg',
    'AWEFUL-bad_iD',
    '882894-s3',
    'PiCkLeS',
    '31337-ID',
];

/**
 * Sample data
 * :: valid basic version, no missing children content
 */
export const DATA_BASIC = [
    {
        name: '125313-7j',
        accountName: 'Dach-Welch',
        phone: '995-523-7024',
    },
    {
        name: '584996-s7',
        accountName: 'Corkery-Windler',
        phone: '782-821-1550',
        _children: [
            {
                name: '747773-jw',
                accountName: 'Corkery-Abshire',
                phone: '853-178-9812',
            },
            {
                name: '377526-zg',
                accountName: 'Robel, Friesen and Flatley',
                phone: '998-407-2397',
                _children: [
                    {
                        name: '955330-wp',
                        accountName: 'Donnelly Group',
                        phone: '793-364-7272',
                    },
                    {
                        name: '343693-9x',
                        accountName: 'Kshlerin Group',
                        phone: '507-263-1845',
                    },
                ],
            },
            {
                name: '638483-y2',
                accountName: 'Bruen, Steuber and Spencer',
                phone: '885-894-0765',
            },
        ],
    },
    {
        name: '306979-mx',
        accountName: 'Spinka LLC',
        phone: '554-511-7090',
    },
    {
        name: '066195-o1',
        accountName: 'Koelpin LLC',
        phone: '475-729-2184',
        _children: [],
    },
];

/**
 * Sample data
 * :: valid basic version, with missing children content
 */
export const DATA_MISSING_CHILDREN_CONTENT = [
    {
        name: '125313-7j',
        accountName: 'Dach-Welch',
        phone: '995-523-7024',
    },
    {
        name: '584996-s7',
        accountName: 'Corkery-Windler',
        phone: '782-821-1550',
        _children: [],
    },
    {
        name: '816682-xr',
        accountName: 'Schmitt-Littel',
        phone: '738-511-9698',
        _children: [
            {
                name: '118985-mf',
                accountName: 'Hegmann-Turcotte',
                phone: '374-284-2270',
            },
            {
                name: '841476-yo',
                accountName: 'Kuhlman LLC',
                phone: '815-872-1009',
            },
        ],
    },
    {
        name: '653331-j4',
        accountName: 'Swaniawski-Hilpert',
        phone: '366-145-6134',
        _children: [
            {
                name: '605249-ei',
                accountName: 'Swaniawski, Veum and Barton',
                phone: '792-328-3002',
            },
            {
                name: '686777-5d',
                accountName: 'Lubowitz, McClure and Russel',
                phone: '234-195-6905',
            },
            {
                name: '582166-n4',
                accountName: 'Reichel-Jerde',
                phone: '420-801-2005',
                _children: [
                    {
                        name: '513683-mm',
                        accountName: 'Tromp Inc',
                        phone: '524-614-6549',
                    },
                ],
            },
        ],
    },
    {
        name: '306979-mx',
        accountName: 'Spinka LLC',
        phone: '554-511-7090',
    },
    {
        name: '066195-o1',
        accountName: 'Koelpin LLC',
        phone: '475-729-2184',
        _children: [],
    },
];

/**
 * Sample data
 * :: used by examples
 */
export const EXAMPLES_DATA_BASIC = [
    {
        name: '123555',
        accountName: 'Rewis Inc',
        employees: 3100,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/jane-doe',
        accountOwnerName: 'Jane Doe',
        billingCity: 'Phoeniz, AZ',
    },

    {
        name: '123556',
        accountName: 'Acme Corporation',
        employees: 10000,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'San Francisco, CA',
        _children: [
            {
                name: '123556-A',
                accountName: 'Acme Corporation (Bay Area)',
                employees: 3000,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'New York, NY',
                _children: [
                    {
                        name: '123556-A-A',
                        accountName: 'Acme Corporation (Oakland)',
                        employees: 745,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/john-doe',
                        accountOwnerName: 'John Doe',
                        billingCity: 'New York, NY',
                    },
                    {
                        name: '123556-A-B',
                        accountName: 'Acme Corporation (San Francisco)',
                        employees: 578,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/jane-doe',
                        accountOwnerName: 'Jane Doe',
                        billingCity: 'Los Angeles, CA',
                    },
                ],
            },

            {
                name: '123556-B',
                accountName: 'Acme Corporation (East)',
                employees: 430,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'San Francisco, CA',
                _children: [
                    {
                        name: '123556-B-A',
                        accountName: 'Acme Corporation (NY)',
                        employees: 1210,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/jane-doe',
                        accountOwnerName: 'Jane Doe',
                        billingCity: 'New York, NY',
                    },
                    {
                        name: '123556-B-B',
                        accountName: 'Acme Corporation (VA)',
                        employees: 410,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/john-doe',
                        accountOwnerName: 'John Doe',
                        billingCity: 'New York, NY',
                        _children: [
                            {
                                name: '123556-B-B-A',
                                accountName: 'Allied Technologies',
                                employees: 390,
                                phone: '837-555-1212',
                                accountOwner: 'http://example.com/jane-doe',
                                accountOwnerName: 'Jane Doe',
                                billingCity: 'Los Angeles, CA',
                                _children: [
                                    {
                                        name: '123556-B-B-A-A',
                                        accountName: 'Allied Technologies (UV)',
                                        employees: 270,
                                        phone: '837-555-1212',
                                        accountOwner:
                                            'http://example.com/john-doe',
                                        accountOwnerName: 'John Doe',
                                        billingCity: 'San Francisco, CA',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        name: '123557',
        accountName: 'Rhode Enterprises',
        employees: 6000,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'New York, NY',
        _children: [
            {
                name: '123557-A',
                accountName: 'Rhode Enterprises (UCA)',
                employees: 2540,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'New York, NY',
            },
        ],
    },

    {
        name: '123558',
        accountName: 'Tech Labs',
        employees: 1856,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'New York, NY',
        _children: [
            {
                name: '123558-A',
                accountName: 'Opportunity Resources Inc',
                employees: 1934,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'Los Angeles, CA',
            },
        ],
    },
];

/**
 * Sample data
 * :: used by lazy loading example
 */
export const EXAMPLES_DATA_LAZY_LOADING = [
    {
        name: '123555',
        accountName: 'Rewis Inc',
        employees: 3100,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/jane-doe',
        accountOwnerName: 'Jane Doe',
        billingCity: 'Phoeniz, AZ',
    },

    {
        name: '123556',
        accountName: 'Acme Corporation',
        employees: 10000,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'San Francisco, CA',
        _children: [
            {
                name: '123556-A',
                accountName: 'Acme Corporation (Bay Area)',
                employees: 3000,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'New York, NY',
                _children: [],
            },

            {
                name: '123556-B',
                accountName: 'Acme Corporation (East)',
                employees: 430,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'San Francisco, CA',
                _children: [
                    {
                        name: '123556-B-A',
                        accountName: 'Acme Corporation (NY)',
                        employees: 1210,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/jane-doe',
                        accountOwnerName: 'Jane Doe',
                        billingCity: 'New York, NY',
                    },
                    {
                        name: '123556-B-B',
                        accountName: 'Acme Corporation (VA)',
                        employees: 410,
                        phone: '837-555-1212',
                        accountOwner: 'http://example.com/john-doe',
                        accountOwnerName: 'John Doe',
                        billingCity: 'New York, NY',
                        _children: [],
                    },
                ],
            },
        ],
    },

    {
        name: '123557',
        accountName: 'Rhode Enterprises',
        employees: 6000,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'New York, NY',
        _children: [
            {
                name: '123557-A',
                accountName: 'Rhode Enterprises (UCA)',
                employees: 2540,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'New York, NY',
            },
        ],
    },

    {
        name: '123558',
        accountName: 'Tech Labs',
        employees: 1856,
        phone: '837-555-1212',
        accountOwner: 'http://example.com/john-doe',
        accountOwnerName: 'John Doe',
        billingCity: 'New York, NY',
        _children: [
            {
                name: '123558-A',
                accountName: 'Opportunity Resources Inc',
                employees: 1934,
                phone: '837-555-1212',
                accountOwner: 'http://example.com/john-doe',
                accountOwnerName: 'John Doe',
                billingCity: 'Los Angeles, CA',
            },
        ],
    },
];
