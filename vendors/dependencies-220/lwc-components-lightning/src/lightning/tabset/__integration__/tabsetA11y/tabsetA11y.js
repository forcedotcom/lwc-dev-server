import { LightningElement, api, track } from 'lwc';

const NUM_OF_TABS = 3;

export default class TabsetA11y extends LightningElement {
    get tabs() {
        const tabs = [];
        for (let i = 0; i < NUM_OF_TABS; i++) {
            tabs.push({
                id: i,
                label: `Item ${i}`,
                content: `Tab ${i} content`,
            });
        }
        return tabs;
    }
}
