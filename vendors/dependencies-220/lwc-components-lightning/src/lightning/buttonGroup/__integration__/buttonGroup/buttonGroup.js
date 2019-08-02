import { LightningElement, api, track } from 'lwc';
import * as buttonGroupUtils from 'lightning/testUtilsButtonGroup';

export default class ButtonGroup extends LightningElement {
    @api numButtons = 4;
    @api numButtonStatefuls = 1;
    @api numButtonIcons = 2;
    @api numButtonIconStatefuls = 2;
    @api numButtonMenus = 1;

    @track buttons = [];
    @track buttonStatefuls = [];
    @track buttonIcons = [];
    @track buttonIconStatefuls = [];
    @track buttonMenus = [];

    connectedCallback() {
        this.buttons = buttonGroupUtils.generateRandomButtonsArray(
            this.numButtons
        );
        this.buttonStatefuls = buttonGroupUtils.generateRandomButtonStatefulsArray(
            this.numButtonStatefuls
        );
        this.buttonIcons = buttonGroupUtils.generateRandomButtonIconsArray(
            this.numButtonIcons
        );
        this.buttonIconStatefuls = buttonGroupUtils.generateRandomButtonIconStatefulsArray(
            this.numButtonIconStatefuls
        );
        this.buttonMenus = buttonGroupUtils.generateRandomButtonMenusArray(
            this.numButtonMenus
        );
    }

    @api
    appendButton() {
        this.buttons.push(buttonGroupUtils.generateRandomButtonsArray(1)[0]);
    }

    @api
    prependButton() {
        this.buttons.unshift(buttonGroupUtils.generateRandomButtonsArray(1)[0]);
    }

    @api
    insertButton() {
        const centerIndex = Math.round((this.buttons.length - 1) / 2);
        this.buttons.splice(
            centerIndex,
            0,
            buttonGroupUtils.generateRandomButtonsArray(1)[0]
        );
    }

    @api
    get totalInitialNumberButtons() {
        return (
            this.numButtons +
            this.numButtonStatefuls +
            this.numButtonIcons +
            this.numButtonIconStatefuls +
            this.numButtonMenus
        );
    }
}
