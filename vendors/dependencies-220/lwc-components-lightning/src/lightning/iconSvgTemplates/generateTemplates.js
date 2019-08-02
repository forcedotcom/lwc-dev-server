const fs = require('fs-extra');
const xml2js = require('xml2js');
const path = require('path');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder({
    rootName: 'g',
    explicitRoot: false,
    headless: true,
    renderOpts: {
        pretty: true,
        indent: ' ',
        newline: '\n',
        allowEmpty: true,
    },
});

const base = (content, viewBox) => `<template>
    <svg class={computedClass} focusable="false" data-key={name} aria-hidden="true" viewBox="${viewBox}">
        ${content}
    </svg>
</template>
`;

const SPRITES = ['action', 'standard', 'utility', 'doctype', 'custom'];
const ALIAS = {
    package: 'packageIcon',
};

const templates = {};
const buildFolder = path.join(__dirname, './buildTemplates');

// clean up previous templates
fs.removeSync(buildFolder);
fs.mkdirSync(buildFolder);

function alias(id) {
    return ALIAS[id] || id;
}

SPRITES.forEach(spriteName => {
    const spriteTemplatesFolder = path.join(buildFolder, spriteName);
    fs.mkdirSync(spriteTemplatesFolder);
    const sprintePath = path.join(
        __dirname,
        `../../../../../../node_modules/@salesforce-ux/design-system/assets/icons/${spriteName}-sprite/svg/symbols.svg`
    );
    const file = fs.readFileSync(sprintePath);

    templates[spriteName] = [];

    parser.parseString(file.toString(), (error, result) => {
        const { svg: { symbol: symbols } } = result;
        symbols.forEach(symbol => {
            const id = symbol.$.id;
            const viewBox = symbol.$.viewBox;
            templates[spriteName].push(id);
            symbol.$ = {};
            const content = builder.buildObject(symbol);
            const output = path.join(
                spriteTemplatesFolder,
                `${alias(id)}.html`
            );
            fs.writeFileSync(output, base(content, viewBox), { flag: 'w+' });
        });
    });
});

const imports = Object.keys(templates).reduce((content, spriteName) => {
    templates[spriteName].forEach(id => {
        content += `export { default as ${spriteName}_${id} } from './${spriteName}/${alias(
            id
        )}.html';\n`;
    });
    return content;
}, '');

const templatesPath = path.join(buildFolder, 'templates.js');
fs.writeFileSync(templatesPath, imports, { flag: 'w+' });
