// Regression checks for the admin identity rule. Run: npm test
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/admin-user.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { getAdminUser } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

assert.equal(getAdminUser(null), null);

// The role lives in app_metadata; user_metadata must not grant access.
assert.equal(getAdminUser({ id: 'u1', app_metadata: { role: 'admin' } }).username, 'admin');
assert.deepEqual(getAdminUser({ id: 'u1', app_metadata: { role: 'admin', username: 'sanyi' } }), {
  id: 'u1',
  username: 'sanyi',
  role: 'admin',
});
assert.equal(getAdminUser({ id: 'u2', app_metadata: { role: 'editor' } }), null);
assert.equal(getAdminUser({ id: 'u3', app_metadata: {} }), null);
assert.equal(getAdminUser({ id: 'u4', app_metadata: { role: 'admin' }, user_metadata: { role: 'admin' }, email: 'x' }).role, 'admin');

console.log('Admin identity regression checks passed');
