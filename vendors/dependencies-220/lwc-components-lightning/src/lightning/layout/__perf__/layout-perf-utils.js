const HORIZONTAL_ALIGN = 'horizontalAlign';
const VERTICAL_ALIGN = 'verticalAlign';
const PULL_TO_BOUNDARY = 'pullToBoundary';

const LAYOUT_ATTRIBUTE_VALUES = {
    horizontalAlign: ['center', 'space', 'spread', 'end'],
    verticalAlign: ['center', 'start', 'stretch', 'end'],
    pullToBoundary: ['small', 'medium', 'large'],
};

const FLEXIBILITY = 'flexibility';
const ALIGNMENT_BUMP = 'alignmentBump';
const PADDING = 'padding';

const LAYOUT_ITEM_ATTRIBUTE_VALUES = {
    flexibility: ['auto', 'no-flex', 'shrink', 'no-shrink', 'grow', 'no-grow'],
    alignmentBump: ['left', 'top', 'right', 'bottom'],
    padding: [
        'horizontal-small',
        'horizontal-medium',
        'horizontal-large',
        'around-small',
        'around-medium',
        'around-large',
    ],
};

function getLayoutAttribute(attribute, index) {
    return getAttribute(LAYOUT_ATTRIBUTE_VALUES, attribute, index);
}

function getLayoutItemAttribute(attribute, index) {
    return getAttribute(LAYOUT_ITEM_ATTRIBUTE_VALUES, attribute, index);
}

function getAttribute(attributeList, attribute, index) {
    return attributeList[index % attributeList.length];
}

function generateLayoutItems(layoutItemCount, layoutId) {
    const layoutItems = [];

    for (let i = 0; i < layoutItemCount; i++) {
        layoutItems.push({
            key: `${layoutId}-${i}`,
            flexibility: getLayoutItemAttribute(FLEXIBILITY, i),
            alignmentBump: getLayoutItemAttribute(ALIGNMENT_BUMP, i),
            padding: getLayoutItemAttribute(PADDING, i),
            size: i % 12 + 1,

            body: `${layoutId} content ${i}`,
        });
    }

    return layoutItems;
}

export function generateLayouts(layoutCount, layoutItemCount) {
    const layouts = [];

    for (let i = 0; i < layoutCount; i++) {
        layouts.push({
            horizontalAlign: getLayoutAttribute(HORIZONTAL_ALIGN, i),
            verticalAlign: getLayoutAttribute(VERTICAL_ALIGN, i),
            pullToBoundary: getLayoutAttribute(PULL_TO_BOUNDARY, i),
            multipleRows: !(i % 2),

            layoutItems: generateLayoutItems(layoutItemCount, `layout-${i}`),
        });
    }

    return layouts;
}

export function updateLayoutElement(layoutElement, index) {
    layoutElement.horizontalAlign = getLayoutAttribute(
        HORIZONTAL_ALIGN,
        index + 1
    );
    layoutElement.verticalAlign = getLayoutAttribute(VERTICAL_ALIGN, index + 1);
    layoutElement.pullToBoundary = getLayoutAttribute(
        PULL_TO_BOUNDARY,
        index + 1
    );
    layoutElement.multipleRows = !!(index % 2);

    layoutElement.layoutItems = generateLayoutItems(
        layoutElement.layoutItems.length,
        `layout-${index}-updated`
    );
}
