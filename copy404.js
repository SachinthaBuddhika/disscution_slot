// This script copies index.html to 404.html for GitHub Pages SPA routing
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const dest = path.join(__dirname, '404.html');

fs.copyFileSync(src, dest);
console.log('404.html created for GitHub Pages routing.');
