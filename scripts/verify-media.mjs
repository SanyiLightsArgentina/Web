// Regression checks for the media policy. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/media.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { mediaDestination, validateMedia, sanitizePathSegment, contentTypeFor } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

const image = { name: 'Studio Shot.PNG', type: 'image/png', size: 1200 };
const pdf = { name: 'manual técnico.pdf', type: 'application/pdf', size: 1200 };
const video = { name: 'demo.webm', type: 'video/webm', size: 1200 };

assert.equal(sanitizePathSegment('SPL LED/800'), 'SPL_LED_800');
assert.equal(sanitizePathSegment('   '), 'archivo');

// Product assets stay inside the product namespace and share one sanitizer.
assert.deepEqual(mediaDestination({ kind: 'product-image', model: 'SPL LED/800' }, image, 'id1'), {
  bucket: 'product-images',
  path: 'products/SPL_LED_800/id1_Studio_Shot.PNG',
  cacheControl: '31536000',
});
assert.equal(
  mediaDestination({ kind: 'product-content', model: 'A' }, image, 'id2').path,
  'products/A/content/images/id2_Studio_Shot.PNG',
);
assert.equal(
  mediaDestination({ kind: 'product-content', model: 'A' }, pdf, 'id3').path,
  'products/A/content/documents/id3_manual_te_cnico.pdf',
);
assert.equal(
  mediaDestination({ kind: 'product-video', model: 'A' }, video, 'id4').path,
  'products/A/videos/id4.webm',
);

// Site media leaves the product namespace.
assert.equal(
  mediaDestination({ kind: 'site-video', section: 'hero' }, video, 'id5').path,
  'site/hero/id5.webm',
);
assert.equal(
  mediaDestination({ kind: 'client-logo', clientId: 'client 1' }, image, 'id6').path,
  'clients/client_1/id6.png',
);

// Validation is policy, not caller knowledge.
assert.equal(validateMedia({ kind: 'client-logo', clientId: '1' }, image), null);
assert.match(validateMedia({ kind: 'client-logo', clientId: '1' }, { ...image, type: 'image/gif' }), /PNG/);
assert.match(validateMedia({ kind: 'client-logo', clientId: '1' }, { ...image, size: 10 * 1024 * 1024 + 1 }), /10 MB/);
assert.match(validateMedia({ kind: 'product-image', model: 'A' }, { ...image, type: 'image/gif' }), /estática/);
assert.match(validateMedia({ kind: 'product-video', model: 'A' }, { name: 'x.txt', type: 'text/plain', size: 10 }), /video/);
assert.equal(validateMedia({ kind: 'site-video', section: 'videos' }, video), null);
assert.match(validateMedia({ kind: 'product-content', model: 'A' }, { ...pdf, size: 0 }), /vacío/);
assert.equal(contentTypeFor({ name: 'clip.MP4', type: '' }), 'video/mp4');

console.log('Media regression checks passed');
