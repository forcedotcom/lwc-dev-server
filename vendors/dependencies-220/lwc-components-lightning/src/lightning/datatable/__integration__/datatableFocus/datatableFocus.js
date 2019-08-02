import { LightningElement, track } from 'lwc';

const actions = [
    {
        label: 'Delete',
        iconName: 'utility:delete',
        name: 'delete',
    },
    {
        label: 'Delete Next',
        iconName: 'utility:delete',
        name: 'delete_next',
    },
    {
        label: 'Delete Two',
        iconName: 'utility:delete',
        name: 'delete_two',
    },
    {
        label: 'Delete Add',
        iconName: 'utility:delete',
        name: 'delete_add',
    },
    {
        label: 'Delete Row Col',
        iconName: 'utility:delete',
        name: 'delete_row_column',
    },
    {
        label: 'Delete Row Col Last',
        iconName: 'utility:delete',
        name: 'delete_row_column_last',
    },
    {
        label: 'Delete Col',
        iconName: 'utility:delete',
        name: 'delete_col',
    },
    {
        label: 'Delete Col Last',
        iconName: 'utility:delete',
        name: 'delete_col_last',
    },
];

const data = [
    {
        id: 1,
        name: 'matrix',
        author: 'Arya Stark',
        email: 'arya.start@example.com',
    },
    {
        id: 2,
        name: 'syndicate',
        author: 'John Snow',
        email: 'john.snow@example.com',
    },
    {
        id: 3,
        name: 'monetize',
        author: 'Jamie Lanister',
        email: 'jamie.lanister@example.com',
    },
    {
        id: 4,
        name: 'extend',
        author: 'Anita Baumbach',
        email: 'anita.baubach@example.com',
    },
    {
        id: 5,
        name: 'evolve',
        author: 'Otto Stark',
        email: 'otto.stark@example.com',
    },
    {
        id: 6,
        name: 'optimize',
        author: 'Markus Wyman',
        email: 'markus.wyman@example.com',
    },
    {
        id: 7,
        name: 'target',
        author: 'Cole Legros',
        email: 'cole.legros@example.com',
    },
];

const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Author', fieldName: 'author' },
    { label: 'Email', fieldName: 'email' },
    {
        label: 'Action',
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class DataTableFocusTest extends LightningElement {
    @track data = data;
    @track columns = columns;

    changeData() {
        const arr = Array.from(this.data);
        arr.splice(2, 5);
        this.data = arr;
    }

    resetData() {
        const arr = Array.from(this.data);
        this.data = arr;
    }

    buttonDeleteRow(event) {
        const arr = Array.from(this.data);
        arr.splice(0, 1);
        this.data = arr;
    }

    handleAction(event) {
        const row = event.detail.row;
        const action = event.detail.action.name;
        if (action === 'delete') {
            this.deleteRow(row);
        } else if (action === 'delete_next') {
            this.deleteNext(row);
        } else if (action === 'delete_row_column') {
            this.deleteRowCol(row);
        } else if (action === 'delete_row_column_last') {
            this.deleteRowColLast(row);
        } else if (action === 'delete_two') {
            this.deleteTwo(row);
        } else if (action === 'delete_add') {
            this.deleteAdd(row);
        } else if (action === 'delete_col') {
            this.deleteCol(row);
        } else if (action === 'delete_col_last') {
            this.deleteLastCol(row);
        }
    }

    findIndex(arr, row) {
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].id === row.id) {
                return i;
            }
        }
        return -1;
    }

    deleteRow(row) {
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        newArr.splice(rowIndex, 1);
        this.data = newArr;
    }

    deleteAdd(row) {
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        newArr.splice(rowIndex, 1);
        newArr.push({
            id: 8,
            name: 'innovate',
            author: 'Reineir Guerra',
            email: 'r.g@example.com',
        });
        this.data = newArr;
    }

    deleteRowCol(row) {
        const newCols = Array.from(this.columns);
        newCols.splice(0, 1);
        this.columns = newCols;
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        newArr.splice(rowIndex, 1);
        this.data = newArr;
    }

    deleteCol(row) {
        const newCols = Array.from(this.columns);
        newCols.splice(0, 1);
        this.columns = newCols;
    }

    deleteLastCol(row) {
        const newCols = Array.from(this.columns);
        newCols.splice(this.columns.length - 1, 1);
        this.columns = newCols;
    }

    deleteRowColLast(row) {
        const newCols = Array.from(this.columns);
        newCols.splice(this.columns.length - 1, 1);
        this.columns = newCols;
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        newArr.splice(rowIndex, 1);
        this.data = newArr;
    }

    deleteNext(row) {
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        newArr.splice(rowIndex + 1, 1);
        this.data = newArr;
    }

    deleteTwo(row) {
        const newArr = Array.from(this.data);
        const rowIndex = this.findIndex(newArr, row, 'id');
        if (rowIndex === newArr.length - 1) {
            newArr.splice(rowIndex - 1, 2);
        } else {
            newArr.splice(rowIndex, 2);
        }
        this.data = newArr;
    }

    get showRowNumberColumn() {
        return false;
    }
}
