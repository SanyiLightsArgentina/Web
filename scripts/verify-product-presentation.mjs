// Regression checks for the product presentation view model. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/product-summary.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { buildProductPresentation } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

const product = {
  id: 4,
  model: 'SPL LED/800',
  description: 'LED moving head',
  category_id: 2,
  category_name: 'Moving Head',
  images: ['a.webp', 'b.webp'],
  contents: ['manual.pdf'],
  videos: [],
  new: true,
};

const presentation = buildProductPresentation(product, { cardImage: 'card.webp', thumbImage: 'thumb.webp' });
assert.equal(presentation.categoryLabel, 'Moving Head');
assert.equal(presentation.cardImage, 'card.webp');
assert.equal(presentation.thumbImage, 'thumb.webp');
assert.deepEqual(presentation.counts, { images: 2, contents: 1, videos: 0 });
assert.equal(presentation.isNew, true);
assert.equal(presentation.href, `/producto/${encodeURIComponent('SPL LED/800')}`);
assert.equal(presentation.categoryId, 2);

// The label falls back to the category list, then to a safe default.
const withoutJoinedName = buildProductPresentation(
  { ...product, category_name: '' },
  { cardImage: '', thumbImage: '' },
  [{ id: 2, name: 'From list' }],
);
assert.equal(withoutJoinedName.categoryLabel, 'From list');
const unknownCategory = buildProductPresentation(
  { ...product, category_name: '', category_id: 99 },
  { cardImage: '', thumbImage: '' },
  [{ id: 2, name: 'From list' }],
);
assert.equal(unknownCategory.categoryLabel, 'Sin categoría');

// Missing arrays are counts of zero, not undefined.
const empty = buildProductPresentation(
  { model: 'X', description: 'Y', category_id: 1, category_name: '', new: false },
  { cardImage: '', thumbImage: '' },
);
assert.deepEqual(empty.counts, { images: 0, contents: 0, videos: 0 });

console.log('Product presentation regression checks passed');
