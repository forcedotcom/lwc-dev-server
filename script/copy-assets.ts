import path from 'path';
import { cp, mkdir } from 'shelljs';

const src = path.join(__dirname, '..', 'src');
const dist = path.join(__dirname, '..', 'dist');
const assets = path.join(dist, 'assets');

mkdir('-p', assets);

// copy non-compiled files from src to dist
cp('-R', `${src}/assets`, dist);
// cp('-R', `${src}/html`, dist);

cp('-R', `${src}/client`, dist);

// copy SLDS assets
const sldsPath = path.join(
    __dirname,
    '../node_modules/@salesforce-ux/design-system'
);

cp('-R', `${sldsPath}/assets/styles`, assets);

mkdir('-p', `${assets}/fonts`);
cp('-R', `${sldsPath}/assets/fonts/webfonts`, `${assets}/fonts`);

mkdir('-p', `${assets}/icons`);
cp('-R', `${sldsPath}/assets/icons/*-sprite`, `${assets}/icons`);
