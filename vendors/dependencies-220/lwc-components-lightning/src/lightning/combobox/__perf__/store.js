const MAX_NUM_OF_OPTIONS = 600;
let _store = null;

class Store {
    options = [];
    values = [];

    constructor() {
        this.buildData();
    }

    buildData() {
        const options = [];
        for (let i = 0; i < MAX_NUM_OF_OPTIONS; i++) {
            options.push({
                value: `${i}`,
                label: `Item ${i}`,
            });
        }
        this.options = options;

        this.values = [...Array(MAX_NUM_OF_OPTIONS).keys()];
    }
}

export default function getStore() {
    if (!_store) {
        _store = new Store();
    }
    return _store;
}
