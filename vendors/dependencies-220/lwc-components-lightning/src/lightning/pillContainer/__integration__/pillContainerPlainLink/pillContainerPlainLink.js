import { LightningElement } from 'lwc';

export default class PillContainerPlainLink extends LightningElement {
    items = [
        {
            type: 'avatar',
            href: 'https://www.google.com',
            label: 'Avatar Pill1',
            src: '/assets/images/avatar2.jpg',
            fallbackIconName: 'standard:user',
            variant: 'circle',
            alternativeText: 'User avatar',
        },
        {
            type: 'avatar',
            href: '',
            label: 'Avatar Pill2',
            src: '/assets/images/avatar2.jpg',
            fallbackIconName: 'standard:user',
            variant: 'circle',
            alternativeText: 'User avatar',
        },
        {
            type: 'avatar',
            href: 'http://www.google.com',
            label: 'Avatar Pill3',
            src: '/assets/images/avatar2.jpg',
            fallbackIconName: 'standard:user',
            variant: 'circle',
            alternativeText: 'User avatar',
        },
    ];
}
