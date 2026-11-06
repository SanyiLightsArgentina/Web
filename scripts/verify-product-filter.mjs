// Regression checks for the catalog filter. Run: npm test
// The source is transpiled so the script exercises src/lib/product-utils.ts directly.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/product-utils.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { filterProducts } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

const categories = [
  { id: 1, name: 'Moving Head' },
  { id: 2, name: 'Wash Light' },
];

const products = [
  { model: 'SPL-LED-800', description: 'LED moving head', category_id: 1, new: true },
  { model: 'SPL-COB-200', description: 'Wash light cob', category_id: 2, new: false },
  { model: 'ab', description: 'cd', category_id: 1, new: false },
  { model: 'LED-1', description: 'first', category_id: 2, new: true },
];

const models = result => result.map(product => product.model);

// No filters returns a copy of the catalog in the original order.
const all = filterProducts(products, '', 'Todos', false, categories);
assert.deepEqual(models(all), models(products));
assert.notEqual(all, products);
assert.deepEqual(models(products), ['SPL-LED-800', 'SPL-COB-200', 'ab', 'LED-1']);

// Search is case-insensitive and covers model and description.
assert.deepEqual(models(filterProducts(products, 'LED', 'Todos', false, categories)), ['SPL-LED-800', 'LED-1']);
assert.deepEqual(models(filterProducts(products, 'wash', '', false, categories)), ['SPL-COB-200']);

// Category names resolve to ids, unknown categories return nothing, and duplicate names match all their ids.
assert.deepEqual(models(filterProducts(products, '', 'Moving Head', false, categories)), ['SPL-LED-800', 'ab']);
assert.deepEqual(models(filterProducts(products, '', 'Missing', false, categories)), []);
assert.deepEqual(
  models(filterProducts(
    [
      { model: 'one', description: '', category_id: 1, new: false },
      { model: 'two', description: '', category_id: 2, new: false },
    ],
    '', 'Shared', false,
    [{ id: 1, name: 'Shared' }, { id: 2, name: 'Shared' }],
  )),
  ['one', 'two'],
);

// New-only and combined filters keep the same intersection as before.
assert.deepEqual(models(filterProducts(products, '', 'Todos', true, categories)), ['SPL-LED-800', 'LED-1']);
assert.deepEqual(models(filterProducts(products, 'led', 'Wash Light', true, categories)), ['LED-1']);

// A query must not match across the boundary between model and description.
assert.deepEqual(models(filterProducts(products, 'bc', '', false, categories)), []);
assert.deepEqual(models(filterProducts(products, 'b\u0000c', '', false, categories)), []);

// A new catalog snapshot rebuilds the cached search text.
const otherProducts = [{ model: 'GAMMA', description: 'new snapshot', category_id: 1, new: false }];
assert.deepEqual(models(filterProducts(otherProducts, 'alpha', '', false, categories)), []);
assert.deepEqual(models(filterProducts(otherProducts, 'gamma', '', false, categories)), ['GAMMA']);

console.log('Product filter regression checks passed');
