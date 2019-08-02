import { LightningResizeObserver } from 'lightning/resizeObserver';
import {
    APP_DENSIFICATION_BREAKPOINT,
    appDensityValues,
} from 'lightning/layoutUtils';
import { densityValues, labelAlignValues } from 'lightning/fieldUtils';
import { normalizeString } from 'lightning/utilsPrivate';
import { getOneConfig } from 'lightning/configProvider';

export function doNormalization(val, cmpInterface) {
    const normalized = normalizeString(val, {
        fallbackValue: densityValues.AUTO,
        validValues: [
            densityValues.AUTO,
            densityValues.COMPACT,
            densityValues.COMFY,
        ],
    });
    cmpInterface.setDensityPrivate(normalized);
    setLabelAlignment(cmpInterface);
}

export function setLabelAlignment(cmpInterface) {
    const fieldLabelAlignment = cmpInterface.getLabelAlignmentPrivate();
    if (isDensityComfy(cmpInterface)) {
        if (fieldLabelAlignment !== labelAlignValues.STACKED) {
            cmpInterface.setLabelAlignmentPrivate(labelAlignValues.STACKED);
            wireLabelAlignment(cmpInterface);
        }
    } else if (isDensityCompact(cmpInterface)) {
        if (fieldLabelAlignment !== labelAlignValues.HORIZONTAL) {
            cmpInterface.setLabelAlignmentPrivate(labelAlignValues.HORIZONTAL);
            wireLabelAlignment(cmpInterface);
        }
    }
}

// Only density auto with wired density compact needs resize observer
// If density is auto with wired comfy we can disconnect the observer or not connect it
export function resetResizeObserver(cmp, cmpInterface) {
    if (cmp._resizeObserver && !isWiredDensityAuto(cmpInterface)) {
        // If we have a resize observer and the density is not auto it means it was changed
        // to not auto, we should disconnect the resize observer.
        cmp._resizeObserver.disconnect();
        cmp._resizeObserver = undefined;
    } else if (isWiredDensityAuto(cmpInterface)) {
        // No resize observer and density is auto, we should setup the resize observer
        cmp._resizeObserver = setupResizeObserver(cmpInterface);
    }
}

function isWiredDensityAuto(cmpInterface) {
    const density = cmpInterface.getDensityPrivate();
    const wiredDensity = getOneConfig().densitySetting;
    return (
        density === densityValues.AUTO &&
        wiredDensity !== appDensityValues.COMFY
    );
}

function isDensityComfy(cmpInterface) {
    const density = cmpInterface.getDensityPrivate();
    return (
        (density === densityValues.AUTO &&
            getOneConfig().densitySetting === appDensityValues.COMFY) ||
        density === densityValues.COMFY
    );
}

function isDensityCompact(cmpInterface) {
    const density = cmpInterface.getDensityPrivate();
    return (
        isWiredDensityAuto(cmpInterface) || density === densityValues.COMPACT
    );
}

function setupResizeObserver(cmpInterface) {
    const containerEle = cmpInterface.getContainerElement();

    const resizeObserver = new LightningResizeObserver(
        cmpInterface.getResizeObserverCallback(resizeObserverCallback)
    );
    resizeObserver.observe(containerEle);
    return resizeObserver;
}

export function resizeObserverCallback(cmpInterface) {
    const containerEle = cmpInterface.getContainerElement();
    if (containerEle) {
        const containerWidth = containerEle.getBoundingClientRect().width;
        const fieldLabelAlignment = cmpInterface.getLabelAlignmentPrivate();

        let alignmentChanged = false;
        if (
            containerWidth < APP_DENSIFICATION_BREAKPOINT &&
            fieldLabelAlignment !== labelAlignValues.STACKED
        ) {
            cmpInterface.setLabelAlignmentPrivate(labelAlignValues.STACKED);
            alignmentChanged = true;
        }
        if (
            containerWidth >= APP_DENSIFICATION_BREAKPOINT &&
            fieldLabelAlignment !== labelAlignValues.HORIZONTAL
        ) {
            cmpInterface.setLabelAlignmentPrivate(labelAlignValues.HORIZONTAL);
            alignmentChanged = true;
        }
        if (alignmentChanged) {
            wireLabelAlignment(cmpInterface);
        }
    }
}

function wireLabelAlignment(cmpInterface) {
    const recordUi = cmpInterface.getRecordUi();
    if (recordUi) {
        const fields = cmpInterface.getInputOutputFields();
        recordUi.labelAlignment = cmpInterface.getLabelAlignmentPrivate();
        for (let i = 0; i < fields.length; i += 1) {
            fields[i].wireRecordUi(recordUi);
        }
    }
}
