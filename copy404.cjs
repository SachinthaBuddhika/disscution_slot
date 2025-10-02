// This script copies dist/index.html to dist/404.html for GitHub Pages SPA routing
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist', 'index.html');
const dest = path.join(__dirname, 'dist', '404.html');

if (fs.existsSync(src)) {
	fs.copyFileSync(src, dest);
	console.log('dist/404.html created for GitHub Pages routing.');
} else {
	console.error('dist/index.html not found. Build the project first.');
}
