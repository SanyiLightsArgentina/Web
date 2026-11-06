// Run: ego-browser nodejs < scripts/verification/support-and-new-products.mjs
const task = await taskSpace('Sanyi support verification');
const page = task.page('p1');
await page.goto('http://127.0.0.1:8080/soporte');
await page.waitForSelector('article');
await page.fill('input[aria-label="Buscar archivos por modelo"]', 'SPL-LED-800');
await page.waitForFunction(() => document.querySelectorAll('article').length === 1);
const download = await page.evaluate(() => {
  const article = document.querySelector('article');
  return { model: article.querySelector('h3').textContent, file: article.querySelector('a[target="_blank"]').href };
});
if (download.model !== 'SPL-LED-800' || !download.file.includes('product-content/')) throw new Error('No se encuentra el manual del equipo');
await page.fill('input[aria-label="Buscar archivos por modelo"]', 'modelo-inexistente');
await page.waitForFunction(() => document.body.textContent.includes('No encontramos archivos para esta búsqueda'));
await page.click('loc=role:button[name="Limpiar filtros"]');
await page.waitForSelector('article');
console.log('PASS: búsqueda de manual real, estado vacío y restablecer filtros');
await page.goto('http://127.0.0.1:8080/');
await page.waitForSelector('a[href^="/producto/"]');
const home = await page.evaluate(async () => {
  const { supabase } = await import('/src/lib/supabase.ts');
  const { data, error } = await supabase.from('products').select('model,new');
  if (error) throw new Error(error.message);
  const section = [...document.querySelectorAll('section')].find(s => s.textContent.includes('Descubrí las novedades'));
  const cards = [...section.querySelectorAll('a[href^="/producto/"]')];
  return {
    expected: data.filter(p => p.new).map(p => p.model).sort(),
    actual: cards.map(c => decodeURIComponent(c.getAttribute('href').slice('/producto/'.length))).sort(),
    allTagged: cards.every(c => c.textContent.includes('Nuevo')),
    testimonials: document.body.textContent.includes('Lo que dicen nuestros clientes'),
    supportLink: !!document.querySelector('a[href="/soporte"]'),
  };
});
if (JSON.stringify(home.expected) !== JSON.stringify(home.actual) || !home.allTagged || home.testimonials || !home.supportLink) throw new Error(JSON.stringify(home));
console.log({newProducts:home.actual.length, allTagged:home.allTagged, testimonialsRemoved:!home.testimonials, supportLink:home.supportLink, pass:true});
await page.cdp('Emulation.setDeviceMetricsOverride', { width:390, height:844, deviceScaleFactor:1, mobile:true });
await page.goto('http://127.0.0.1:8080/soporte');
await page.waitForSelector('article');
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (overflow) throw new Error('El centro de descargas desborda en móvil');
console.log('PASS: soporte en móvil sin desbordamiento horizontal');
console.log({screenshot: await page.screenshot({path:'/tmp/sanyi-support-mobile.png'})});
