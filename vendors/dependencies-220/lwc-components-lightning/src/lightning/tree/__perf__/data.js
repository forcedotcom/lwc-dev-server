const ACCOUNTS = [
    'Burlington',
    'Burlington Textiles Corp of America',
    'Edge Communications',
    'Express Logistics and Transport',
    'Express Logistics',
    'GenePoint',
    'Grand Hotels & Resorts Ltd',
    'Pyramid Construction Inc.',
    'United Oil & Gas Corp.',
    'United Oil Refinery Generators',
];

let nextId = 1;

export default class Store {
    constructor(count, levels, childrenAtLevel) {
        this.id = 1;
        this.buildData(count, levels, childrenAtLevel);
    }

    buildData(countRows = 100, levels = 10, childrenAtLevel = 2) {
        // generate level one rows
        const rows = this.getTree(countRows);
        // recursively add rows to level one for levelTotal with each childrenAtLevel
        this.addNodes(rows, levels, childrenAtLevel, 2);
        this.data = rows;
        return this;
    }

    getTree(numChild, isLast = false) {
        const items = [];
        let node = null;
        for (let i = 0; i < numChild; i++) {
            node = this.generateNode(isLast);
            items.push(node);
        }
        return items;
    }

    generateNode(isLast) {
        const id = nextId++;
        const label = `${ACCOUNTS[(id - 1) % 10]}`;
        const row = {
            name: `${id}`,
            label,
            metatext: `meta &middot; ${label}`,
        };
        row.expanded = true;
        if (!isLast) {
            row.items = [];
        }
        return row;
    }

    addNodes(rows, levelTotal, childrenAtLevel, level) {
        if (level > levelTotal) {
            return;
        }
        rows.forEach(row => {
            const children = this.getTree(
                childrenAtLevel,
                level === levelTotal
            );
            row.items = row.items.concat(children);
            this.addNodes(row.items, levelTotal, childrenAtLevel, level + 1);
        });
        level--;
    }

    updateData(isExpanded) {
        for (let i = 0; i < this.data.length; i++) {
            const node = this.data[i];
            node.expanded = isExpanded;
        }
        return this;
    }
}
