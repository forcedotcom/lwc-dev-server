import { LightningElement, api, track } from 'lwc';

/**
 * Using heap's algorithm to generate permutation
 * ToDo: put this in a utility folder
 */
function generatePermutations(items) {
    const length = items.length;
    const result = [items.slice()];
    const c = new Array(length).fill(0);
    let i = 1;

    while (i < length) {
        if (c[i] < i) {
            const k = i % 2 ? 0 : c[i];
            [items[i], items[k]] = [items[k], items[i]];
            c[i] += 1;
            i = 1;
            result.push(items.slice());
        } else {
            c[i] = 0;
            i += 1;
        }
    }
    return result;
}

function generateStringPermutations(chars) {
    return generatePermutations(chars.split('')).map(permuation =>
        permuation.join('')
    );
}

export default class TabsetOverflow extends LightningElement {
    @track labelPrefix = 'Tab Menu ';
    @track numOfTabs = 10;
    @track tabsToHide = [];

    get tabs() {
        // Use same set of chars to make sure every label has approximately the same width.
        // With this we don't need to sample the width of every tab in the test to check
        // overflow calculation.
        const tabLabels = generateStringPermutations('Item');

        const tabs = [];
        for (let i = 0; i < this.numOfTabs; i++) {
            const key = i + '';
            tabs.push({
                key,
                label: this.labelPrefix + tabLabels[i],
                content: `Tab ${i} content`,
                show: !this.tabsToHide.includes(key),
            });
        }
        return tabs;
    }

    setLabelPrefix = () => {
        this.labelPrefix = this.template.querySelector(
            '.labelPrefix input'
        ).value;
    };

    setNumOfTabs = () => {
        this.numOfTabs = this.template.querySelector('.numOfTabs input').value;
    };

    setTabsToHide = () => {
        this.tabsToHide = this.template
            .querySelector('.tabsToHide input')
            .value.split(',');
    };
}
