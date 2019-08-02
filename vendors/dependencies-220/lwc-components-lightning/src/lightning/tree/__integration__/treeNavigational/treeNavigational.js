import { LightningElement, track } from 'lwc';

const items = [
    {
        label: 'Go to Section 1',
        name: '1',
        href: '#sectionOne',
    },
    {
        label: 'Go to Section 2',
        name: '2',
        href: '#sectionTwo',
    },
    {
        label: 'Go to Section 3',
        name: '3',
        href: '#sectionThree',
    },
    {
        label: 'Go to Section 4',
        name: '3',
        href: '#sectionFour',
    },
];

export default class TreeNavigational extends LightningElement {
    @track treeList = items;
}
