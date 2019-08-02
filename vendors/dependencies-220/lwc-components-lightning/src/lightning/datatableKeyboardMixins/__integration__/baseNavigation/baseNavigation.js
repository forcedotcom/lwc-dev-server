import { LightningElement, createElement } from 'lwc';
import NativeInputables from './components/native-inputables/native-inputables';

export default class BaseNavigationMixinTest extends LightningElement {
    get container() {
        return this.template.querySelector('.container');
    }

    clearContainer() {
        this.container.innerHTML = '';
    }

    renderNativeInputablesActionMode() {
        this.clearContainer();
        const element = createElement('native-inputables', {
            is: NativeInputables,
        });
        element.keyboardMode = 'ACTION';
        this.container.appendChild(element);
    }

    renderNativeInputablesNavigationMode() {
        this.clearContainer();
        const element = createElement('native-inputables', {
            is: NativeInputables,
        });
        element.keyboardMode = 'NAVIGATION';
        this.container.appendChild(element);
    }

    disableInput() {
        this.template.querySelector('native-inputables').disableInput();
    }

    removeHref() {
        this.template.querySelector('native-inputables').removeHref();
    }

    setInputInvisible() {
        this.template.querySelector('native-inputables').setInputInvisible();
    }

    setInputDisplayNone() {
        this.template.querySelector('native-inputables').setInputDisplayNone();
    }
}
