import { LightningElement, track } from 'lwc';

const books = [
    { id: 'section-1', name: 'The Outsiders' },
    { id: 'section-2', name: 'Le Petit Prince' },
    { id: 'section-3', name: 'The Dog of Flanders' },
    { id: 'section-4', name: 'Catcher in the Rye' },
];
const movies = [
    { id: 'section-1', name: 'Parent Trap' },
    { id: 'section-2', name: 'Black Panther' },
    { id: 'section-3', name: 'Avengers' },
    { id: 'section-4', name: 'Deadpool' },
    { id: 'section-5', name: 'Toy Story' },
];

export default class AccordionConditionalRendering extends LightningElement {
    @track
    state = {
        selectedList: 'books',
        listActive: books,
    };

    onClickHandler(e) {
        if (this.state.selectedList === 'books') {
            this.state.listActive = movies;
            this.state.selectedList = 'movies';
        } else if (this.state.selectedList === 'movies') {
            this.state.listActive = books;
            this.state.selectedList = 'books';
        }
    }
}
