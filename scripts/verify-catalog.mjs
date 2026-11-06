// Regression checks for the catalog read module. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/catalog.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { orderCategories, joinCatalog, categoryLabel, findProductByModel } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

const categories = [
  { id: 1, name: 'Wash Light' },
  { id: 2, name: 'Moving Head' },
  { id: 3, name: 'Laser' },
];

// Configured ids come first in their configured order; the rest stay alphabetical.
assert.deepEqual(
  orderCategories(categories, [3, 1]).map(category => category.name),
  ['Laser', 'Wash Light', 'Moving Head'],
);
assert.deepEqual(
  orderCategories(categories).map(category => category.name),
  ['Laser', 'Moving Head', 'Wash Light'],
);
assert.deepEqual(categories.map(category => category.name), ['Wash Light', 'Moving Head', 'Laser']);

// Joining resolves the category label once per product, with a safe fallback.
const joined = joinCatalog(
  [
    { model: 'A', description: '', category_id: 2, new: false },
    { model: 'B', description: '', category_id: 99, new: false },
  ],
  categories,
);
assert.equal(joined[0].category_name, 'Moving Head');
assert.equal(joined[1].category_name, 'Sin categoría');
assert.equal(categoryLabel(categories, 3), 'Laser');
assert.equal(categoryLabel(categories, undefined), 'Sin categoría');

// Route segments are decoded, and malformed encoding keeps the raw segment.
assert.equal(findProductByModel(joined, 'A')?.model, 'A');
assert.equal(findProductByModel(joined, 'SPL%2DLED%2D800'), undefined);
assert.equal(findProductByModel(joined, '%E0%A4%A'), undefined);

const encoded = joinCatalog([{ model: 'SPL LED 800', description: '', category_id: 1, new: false }], categories);
assert.equal(findProductByModel(encoded, encodeURIComponent('SPL LED 800'))?.model, 'SPL LED 800');

console.log('Catalog regression checks passed');
