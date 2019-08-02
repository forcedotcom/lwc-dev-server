import { createElement } from 'lwc';
import { AutoPosition, Direction } from 'lightning/positionLibrary';
import { assert, guid, normalizeAriaAttribute } from 'lightning/utilsPrivate';
import LightningPrimitiveBubble from 'lightning/primitiveBubble';

const BUBBLE_ID = `salesforce-lightning-tooltip-bubble_${guid()}`;

/**
 * Shared instance of a primitive bubble used as a tooltip by most components. This was originally
 * defined in the helptext component which is where the minWidth style came from.
 * TODO: We may want to revisit the minWidth style with the PO and/or UX.
 */
const CACHED_BUBBLE_ELEMENT = createElement('lightning-primitive-bubble', {
    is: LightningPrimitiveBubble,
});
CACHED_BUBBLE_ELEMENT.contentId = BUBBLE_ID;
CACHED_BUBBLE_ELEMENT.style.position = 'absolute';
CACHED_BUBBLE_ELEMENT.style.minWidth = '75px';

const TOOLTIP_ALIGN = {
    horizontal: Direction.Center,
    vertical: Direction.Bottom,
};

const TARGET_ALIGN = {
    horizontal: Direction.Center,
    vertical: Direction.Top,
};

const ARIA_DESCRIBEDBY = 'aria-describedby';

/**
 * Used as a position offset to compensate for the nubbin. The dimensions of the nubbin are not
 * included in the position library bounding box calculations. This is the size in pixels of the
 * nubbin.
 */
const TOOLTIP_PADDING = 16;

/**
 * Allows us to attach a tooltip to components. Typical usage is as follows:
 * - Create an instance of Tooltip
 * - Call Tooltip.initialize() to add the appropriate listeners to the element that needs a tooltip
 * See buttonIcon and buttonMenu for example usage.
 */
export class Tooltip {
    _autoPosition = null;
    _disabled = true;
    _initialized = false;
    _visible = false;

    /**
     * A shared instance of primitiveBubble is used when an element is not specified in the config
     * object.
     * @param {string} value the content of the tooltip
     * @param {object} config specifies the root component, target element of the tooltip
     */
    constructor(value, config) {
        assert(config.target, 'target for tooltip is undefined or missing');

        this.value = value;

        this._root = config.root;
        this._target = config.target;

        // If a tooltip element is not given, fall back on the globally shared instance.
        this._element = config.element;
        if (!this._element) {
            this._element = () => CACHED_BUBBLE_ELEMENT;
            if (CACHED_BUBBLE_ELEMENT.parentNode === null) {
                document.body.appendChild(CACHED_BUBBLE_ELEMENT);
            }
        }
    }

    /**
     * Disables the tooltip.
     */
    detach() {
        this._disabled = true;
    }

    /**
     * Enables the tooltip.
     */
    attach() {
        this._disabled = false;
    }

    /**
     * Adds the appropriate event listeners to the target element to make the tooltip appear. Also
     * links the tooltip and target element via the aria-describedby attribute for screen readers.
     */
    initialize() {
        const target = this._target();
        if (!this._initialized && target) {
            ['mouseenter', 'focus'].forEach(event =>
                target.addEventListener(event, () => this.show())
            );
            // Unlike the tooltip in Aura, we want clicks and keys to dismiss the tooltip.
            ['mouseleave', 'blur', 'click', 'keydown'].forEach(event =>
                target.addEventListener(event, () => this.hide())
            );
            const ariaDescribedBy = normalizeAriaAttribute([
                target.getAttribute(ARIA_DESCRIBEDBY),
                this._element().contentId,
            ]);
            target.setAttribute(ARIA_DESCRIBEDBY, ariaDescribedBy);

            this._initialized = true;
        }
    }

    show() {
        if (this._disabled) {
            return;
        }

        this._visible = true;
        const tooltip = this._element();
        tooltip.content = this._value;

        this.startPositioning();
    }

    hide() {
        this._visible = false;
        const tooltip = this._element();
        tooltip.visible = this._visible;

        this.stopPositioning();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._disabled = !value;
    }

    get initialized() {
        return this._initialized;
    }

    get visible() {
        return this._visible;
    }

    startPositioning() {
        if (!this._autoPosition) {
            this._autoPosition = new AutoPosition(this._root);
        }

        this._autoPosition
            .start({
                target: this._target,
                element: this._element,
                align: TOOLTIP_ALIGN,
                targetAlign: TARGET_ALIGN,
                autoFlip: true,
                pad: TOOLTIP_PADDING,
            })
            .then(autoPositionUpdater => {
                // The calculation above may have flipped the alignment of the tooltip. When the
                // tooltip flips, we need to draw the nubbin on the opposite side.
                const tooltip = this._element();
                if (tooltip) {
                    tooltip.align = autoPositionUpdater
                        ? autoPositionUpdater.config.align
                        : TOOLTIP_ALIGN;
                    tooltip.visible = this._visible;
                }
            });
    }

    stopPositioning() {
        if (this._autoPosition) {
            this._autoPosition.stop();
        }
    }
}
