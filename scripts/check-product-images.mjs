import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const paths = JSON.parse(await fs.readFile(new URL('../src/lib/optimized-image-paths.json', import.meta.url)));
const origin = 'https://yxldaywdnpzpfeftctpr.supabase.co';
const source = (await fs.readFile(new URL('../src/lib/product-images.ts', import.meta.url), 'utf8'))
  .replace("import paths from './optimized-image-paths.json'", `const paths = ${JSON.stringify(paths)}`)
  .replaceAll('import.meta.env.VITE_PUBLIC_SUPABASE_URL', JSON.stringify(origin));
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { productImageUrl, resizeProductImage } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const original = `${origin}/storage/v1/object/public/product-images/${paths[0].split('/').map(encodeURIComponent).join('/')}`;
for (const size of ['thumb', 'card', 'detail']) {
  assert.equal(productImageUrl(original, size), `${original}/optimized-v1/${size}.webp`);
  assert.equal(productImageUrl(`${original}/optimized-v1/detail.webp`, size), `${original}/optimized-v1/${size}.webp`);
}
for (const unchanged of ['', '/local.png', 'https://example.com/image.jpg', `${origin}/storage/v1/object/public/product-images/unknown.png`, original.replace(origin, 'https://example.com')]) {
  assert.equal(productImageUrl(unchanged, 'card'), unchanged);
}
assert.equal(productImageUrl(undefined, 'thumb'), '');
await assert.rejects(resizeProductImage({ type: 'application/pdf' }, 'card'));
await assert.rejects(resizeProductImage({ type: 'image/gif' }, 'card'));
console.log('Image URL routing and unsupported upload checks passed');
