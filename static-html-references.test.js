const assert = require('assert');
const fs = require('fs');
const path = require('path');

function htmlFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const file = path.join(directory, entry.name);
		return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
	});
}
function assertLocalReference(file, reference) {
	if (!reference.startsWith('.')) return;
	const target = path.resolve(path.dirname(file), reference.split(/[?#]/)[0]);
	assert.ok(fs.existsSync(target), `${file}: missing ${reference}`);
}

htmlFiles('.').forEach(file => {
	const html = fs.readFileSync(file, 'utf8');
	for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) assertLocalReference(file, match[1]);
	for (const match of html.matchAll(/\bimport(?:\s+[\s\S]*?\s+from)?\s*["']([^"']+)["']/g)) assertLocalReference(file, match[1]);
});
assert.strictEqual(fs.existsSync('examples/3d-assetimport/js/pipeline.js'), false, 'duplicate pipeline copy remains');
console.log('static-html-references.test.js passed');
