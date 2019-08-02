import { LightningElement, api, track } from 'lwc';

const NUM_OF_TABS = 3;

export default class TabsetWithActiveTabValue extends LightningElement {
    @track activeValue = '';
    @track tabsToHide = [];
    @track showTabset = false;

    get tabs() {
        const tabs = [];
        for (let i = 0; i < NUM_OF_TABS; i++) {
            const key = i + '';
            tabs.push({
                value: key,
                label: `Item ${i}`,
                content: `Tab ${i} content`,
                show: !this.tabsToHide.includes(key),
            });
        }
        return tabs;
    }

    selectTab() {
        this.activeValue = this.template.querySelectorAll('input')[0].value;
    }

    setTabsToHide() {
        this.tabsToHide = this.template
            .querySelectorAll('input')[1]
            .value.split(',');
    }

    changeTabValue() {
        const tabValueToChange = this.template.querySelectorAll('input')[2]
            .value;
        const tab = this.template.querySelectorAll('lightning-tab')[
            tabValueToChange
        ];
        if (tab) {
            tab.value = Number(tab.value) * 10;
        }
    }

    renderTabset() {
        this.showTabset = true;
    }
}
