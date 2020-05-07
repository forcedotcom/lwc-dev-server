// See iconUtils.js in the lighting components package. The default paths are
// under `/assets`, so override them here since we put them in a different
// location.
const assetsRoot = '/assets/localdev';
export const tokens = {
    'lightning.actionSprite': `${assetsRoot}/icons/action-sprite/svg/symbols.svg`,
    'lightning.actionSpriteRtl': `${assetsRoot}/icons/action-sprite/svg/symbols.svg`,
    'lightning.customSprite': `${assetsRoot}/icons/custom-sprite/svg/symbols.svg`,
    'lightning.customSpriteRtl': `${assetsRoot}/icons/custom-sprite/svg/symbols.svg`,
    'lightning.doctypeSprite': `${assetsRoot}/icons/doctype-sprite/svg/symbols.svg`,
    'lightning.doctypeSpriteRtl': `${assetsRoot}/icons/doctype-sprite/svg/symbols.svg`,
    'lightning.standardSprite': `${assetsRoot}/icons/standard-sprite/svg/symbols.svg`,
    'lightning.standardSpriteRtl': `${assetsRoot}/icons/standard-sprite/svg/symbols.svg`,
    'lightning.utilitySprite': `${assetsRoot}/icons/utility-sprite/svg/symbols.svg`,
    'lightning.utilitySpriteRtl': `${assetsRoot}/icons/utility-sprite/svg/symbols.svg`
};

export function getToken(name) {
    return tokens[name];
}
