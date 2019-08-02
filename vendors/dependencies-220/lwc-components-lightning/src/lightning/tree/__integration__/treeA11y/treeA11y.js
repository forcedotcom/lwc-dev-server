import { LightningElement, track } from 'lwc';
const items = [
    {
        label: 'Item 1',
        name: '1',
        id: '1',
        disabled: false,
        expanded: true,
        items: [
            {
                label: 'Item 1.1',
                name: '1.1',
                id: '1.1',
                expanded: true,
                disabled: false,
                items: [],
            },
            {
                label: 'Item 1.2',
                name: '1.2',
                expanded: true,
                disabled: false,
                items: [
                    {
                        label: 'Item 1.2.1',
                        name: '1.2.1',
                        expanded: true,
                        disabled: false,
                        items: [
                            {
                                label: 'Item 1.2.1.1',
                                name: '1.2.1.1',
                                expanded: true,
                                disabled: false,
                                items: [
                                    {
                                        label: 'Item 1.2.1.1.1',
                                        name: '1.2.1.1.1',
                                        disabled: false,
                                        items: [],
                                    },
                                    {
                                        label: 'Item 1.2.1.1.2',
                                        name: '1.2.1.1.2',
                                        disabled: false,
                                        expanded: true,
                                        items: [
                                            {
                                                label: 'Item 1.2.1.1.2.1',
                                                name: '1.2.1.1.2.1',
                                                disabled: false,
                                                items: [],
                                            },
                                        ],
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
        label: 'Item 2',
        name: '2',
        disabled: false,
        expanded: true,
        items: [
            {
                label: 'Item 2.1',
                name: '2.1',
                expanded: false,
                disabled: false,
                items: [
                    {
                        label: 'Item 2.1.1',
                        name: '2.1.1',
                        expanded: true,
                        disabled: false,
                        items: [],
                    },
                ],
            },
        ],
    },
    {
        label: 'Item 3',
        name: '3',
        disabled: false,
        expanded: false,
        items: [
            {
                label: 'Item 3.1',
                name: '3.1',
                expanded: true,
                disabled: false,
                items: [],
            },
        ],
    },
];
export default class TreeKeystrokes extends LightningElement {
    @track treeList = items;
}
