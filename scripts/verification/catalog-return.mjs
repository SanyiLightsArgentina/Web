// Run: ego-browser nodejs < scripts/verification/catalog-return.mjs
const task = await taskSpace('Sanyi admin verification');
const page = task.page('p1');
await page.goto('http://127.0.0.1:8080/productos');
await page.waitForSelector('a[href^="/producto/"]');
await page.fill('input[placeholder="Buscar productos..."]', 'SPL');
await page.click('loc=role:button[name="2"]');
await page.waitForFunction(() => document.body.textContent.includes('Página 2 de 4'));
await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0, 650); });
const before = await page.evaluate(() => ({url:location.pathname+location.search,y:window.scrollY, href:document.querySelector('a[href^="/producto/"]').getAttribute('href')}));
await page.click(`a[href="${before.href}"]`);
await page.waitForURL('**/producto/**');
await page.click('text="Volver a Productos"');
await page.waitForURL('**/productos**');
await page.waitForSelector('a[href^="/producto/"]');
const after = await page.evaluate(() => ({y:window.scrollY, page2:document.body.textContent.includes('Página 2 de 4')}));
console.log({before,after,pass:after.page2 && Math.abs(after.y-before.y)<60});
if (!after.page2 || Math.abs(after.y-before.y)>=60) throw new Error('El regreso pierde la página o la posición del catálogo');

await page.click(`a[href="${before.href}"]`);
await page.waitForURL('**/producto/**');
await page.evaluate(() => history.back());
await page.waitForFunction(url => location.pathname+location.search === url, before.url);
await page.waitForSelector('a[href^="/producto/"]');
const browserBack = await page.evaluate(() => ({y:window.scrollY, query:document.querySelector('input[placeholder="Buscar productos..."]').value}));
if (Math.abs(browserBack.y-before.y)>=60 || browserBack.query !== 'SPL') throw new Error('Atrás pierde los filtros o el scroll');
console.log({browserBack, pass: true});
