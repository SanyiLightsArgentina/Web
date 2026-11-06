// Regression checks for the parsed site settings. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/site-settings.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { parseSiteSettings, defaultSettings } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

// A partial section keeps every default field it did not provide.
const partialVideos = parseSiteSettings([
  { key: 'videos', value: { channelUrl: 'https://youtube.com/@sanyi' } },
]);
assert.equal(partialVideos.videos.channelUrl, 'https://youtube.com/@sanyi');
assert.equal(partialVideos.videos.items.length, defaultSettings.videos.items.length);

const partialContact = parseSiteSettings([
  { key: 'contact', value: { phone: '5491100000000' } },
]);
assert.equal(partialContact.contact.phone, '5491100000000');
assert.equal(partialContact.contact.email, defaultSettings.contact.email);
assert.equal(partialContact.contact.address, defaultSettings.contact.address);

// Invalid values fall back per section, not for the whole object.
const invalid = parseSiteSettings([
  { key: 'hero', value: 'not-an-array' },
  { key: 'contact', value: null },
  { key: 'videos', value: 42 },
  { key: 'category_order', value: [3, '4', -1, 1.5, 2] },
  { key: 'unknown', value: { anything: true } },
]);
assert.deepEqual(invalid.hero, defaultSettings.hero);
assert.deepEqual(invalid.contact, defaultSettings.contact);
assert.deepEqual(invalid.videos, defaultSettings.videos);
assert.deepEqual(invalid.category_order, [3, 2]);

// Clients and videos are filtered item by item.
const filtered = parseSiteSettings([
  {
    key: 'clients',
    value: [
      { id: 'a', company: 'Acme', logo: 'https://x/logo.png', link: 'https://acme.test' },
      { id: 'b', company: 3 },
      { id: 'c' },
    ],
  },
  {
    key: 'videos',
    value: { items: [{ id: 'x', title: 'Ok', url: 'https://youtu.be/aaaaaaaaaaa' }, { id: 'y' }] },
  },
]);
assert.deepEqual(filtered.clients, [{ id: 'a', company: 'Acme', logo: 'https://x/logo.png', link: 'https://acme.test' }]);
assert.deepEqual(filtered.videos.items, [{ id: 'x', title: 'Ok', url: 'https://youtu.be/aaaaaaaaaaa' }]);

// Empty input returns a complete, independent default tree.
const empty = parseSiteSettings(null);
assert.deepEqual(empty, defaultSettings);
assert.notEqual(empty.videos, defaultSettings.videos);
assert.notEqual(empty.hero, defaultSettings.hero);
assert.notEqual(empty.contact, defaultSettings.contact);

console.log('Site settings regression checks passed');
