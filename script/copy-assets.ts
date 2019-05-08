import path from 'path';
import { cp, mkdir } from 'shelljs';

const src = path.join(__dirname, '../src');
const dest = path.join(__dirname, '../dist');
mkdir('-p', dest);

// copy non-compiled files from src to dist
cp('-R', `${src}/assets`, dest);
cp('-R', `${src}/config`, dest);

// copy SLDS assets
const sldsPath = path.join(
    __dirname,
    '../node_modules/@salesforce-ux/design-system'
);

mkdir('-p', `${dest}/slds`);
cp('-R', `${sldsPath}/assets/styles`, `${dest}/slds`);

mkdir('-p', `${dest}/slds/fonts`);
cp('-R', `${sldsPath}/assets/fonts/webfonts`, `${dest}/slds/fonts`);

mkdir('-p', `${dest}/slds/icons`);
cp('-R', `${sldsPath}/assets/icons/*-sprite`, `${dest}/slds/icons`);
