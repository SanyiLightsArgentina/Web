// Regression checks for the catalog write seam. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/catalog-writes.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { productWritePayload, CatalogWriteError } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

// Identity and server-managed timestamps never reach an insert body.
const payload = productWritePayload({
  id: 7,
  created_at: '2026-01-01',
  updated_at: '2026-01-02',
  model: 'SPL-LED-800',
  description: 'LED moving head',
  category_id: 2,
  images: ['https://example.com/a.webp'],
  contents: [],
  videos: [],
  new: true,
});
assert.equal('id' in payload, false);
assert.equal('created_at' in payload, false);
assert.equal('updated_at' in payload, false);
assert.deepEqual(payload, {
  model: 'SPL-LED-800',
  description: 'LED moving head',
  category_id: 2,
  images: ['https://example.com/a.webp'],
  contents: [],
  videos: [],
  new: true,
});

const error = new CatalogWriteError('No se pudo guardar');
assert.equal(error.name, 'CatalogWriteError');
assert.ok(error instanceof Error);

console.log('Catalog write regression checks passed');
