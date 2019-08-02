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
const PHONE = [
    '837-555-1201',
    '837-555-1202',
    '837-555-1203',
    '837-555-1204',
    '837-555-1205',
    '837-555-1206',
    '837-555-1207',
    '837-555-1208',
    '837-555-1209',
    '837-555-1210',
];
const STATE = ['OR', 'AZ', 'VA', 'NY', 'LV', 'WA', 'FL', 'TX', 'NM', 'NC'];

const URLS = [
    'https://www.example.com/1',
    'https://www.example.com/2',
    'https://www.example.com/3',
    'https://www.example.com/4',
    'https://www.example.com/5',
    'https://www.example.com/6',
    'https://www.example.com/7',
    'https://www.example.com/8',
    'https://www.example.com/9',
    'https://www.example.com/10',
];

let nextId = 1;

export default class Store {
    constructor(count, levels, childrenAtLevel) {
        this.id = 1;
        if (count) {
            this.buildData(count, levels, childrenAtLevel);
        }
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
        const now = Date.now();
        const id = nextId++;
        const row = {
            id,
            accountName: `${ACCOUNTS[id % 10]}`,
            phone: `${PHONE[id % 10]}`,
            url: `${URLS[id % 10]}`,
            state: `${STATE[id % 10]}`,
            created: new Date(now).toString(),
        };
        if (!isLast) {
            row._children = [];
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
            row._children = row._children.concat(children);
            this.addNodes(
                row._children,
                levelTotal,
                childrenAtLevel,
                level + 1
            );
        });
        level--;
    }

    getExpanded(start, end) {
        const expanded = [];
        for (let k = start; k <= end; k++) {
            expanded.push(k);
        }
        return expanded;
    }
}
