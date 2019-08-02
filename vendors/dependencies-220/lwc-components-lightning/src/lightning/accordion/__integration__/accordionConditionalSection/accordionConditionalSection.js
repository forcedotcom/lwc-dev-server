import { LightningElement, track } from 'lwc';
export default class AccordionConditionalSection extends LightningElement {
    @track
    state = {
        buttonText: 'Show Hidden Section',
        isHidden: true,
        changeSectionToBeeMove: true,
        sectionThreeData:
            'Nulla ornare ipsum felis, vel aliquet dui blandit vel. Integer accumsan velit quis mauris pharetra, nec sollicitudin dui eleifend. Cras condimentum odio mi, nec ullamcorper arcu ullamcorper sed. Proin massa arcu, rutrum a ullamcorper nec, hendrerit in sem. Etiam tempus eros ut lorem tincidunt, id condimentum nulla molestie. Morbi hendrerit elit pretium, ultrices neque non, ullamcorper justo. Quisque vel nisi eget eros efficitur semper. Nulla pulvinar venenatis quam vitae efficitur. Nam facilisis sollicitudin quam ac imperdiet.',
        activeSection: 'First Section',
    };

    hiddenSectionHandler(e) {
        if (this.state.isHidden) {
            this.state.buttonText = 'Hide Hidden Section';
            this.state.isHidden = false;
        } else {
            this.state.buttonText = 'Show Hidden Section';
            this.state.isHidden = true;
        }
    }

    changeSectionInfoHandler(e) {
        if (this.state.changeSectionToBeeMove) {
            this.state.sectionThreeData =
                'According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground.';
            this.state.changeSectionToBeeMove = false;
        } else {
            this.state.sectionThreeData =
                'Nulla ornare ipsum felis, vel aliquet dui blandit vel. Integer accumsan velit quis mauris pharetra, nec sollicitudin dui eleifend. Cras condimentum odio mi, nec ullamcorper arcu ullamcorper sed. Proin massa arcu, rutrum a ullamcorper nec, hendrerit in sem. Etiam tempus eros ut lorem tincidunt, id condimentum nulla molestie. Morbi hendrerit elit pretium, ultrices neque non, ullamcorper justo. Quisque vel nisi eget eros efficitur semper. Nulla pulvinar venenatis quam vitae efficitur. Nam facilisis sollicitudin quam ac imperdiet.';
            this.state.changeSectionToBeeMove = true;
        }
    }

    onChangeHandler(e) {
        this.state.activeSection = e.detail.activeSectionName;
    }

    activeSectionHandler(e) {
        const accordion = this.template.querySelector('#accordion-obj');
        this.state.activeSection = 'Second Section';
    }
}
