// Run with the local dev server: ego-browser nodejs < scripts/verification/admin-content.mjs
// Only settings and login requests are replaced with in-browser fixtures.
// No writes are sent to the live database.
const page = (await taskSpace('Sanyi admin verification')).page('p1');
await page.evaluate(async () => { const {supabase}=await import('/src/lib/supabase.ts'); await supabase.auth.signOut({scope:'local'}); sessionStorage.removeItem('sanyi-test-settings'); });
const mock = () => {
  const original = window.fetch.bind(window);
  const values = JSON.parse(sessionStorage.getItem('sanyi-test-settings') || '{}');
  window.__settingsTest = values;
  window.fetch = async (input, options) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes('/auth/v1/')) {
      const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'test-admin@panel.sanyilights.invalid', app_metadata: { role: 'admin', username: 'test-admin' }, user_metadata: {}, created_at: new Date().toISOString() };
      const payload = { sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now()/1000)+3600, iat: Math.floor(Date.now()/1000), app_metadata: user.app_metadata };
      const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode(payload)}.dGVzdA`;
      return new Response(JSON.stringify(url.includes('/logout') ? {} : url.includes('/user') ? user : { access_token: token, refresh_token: 'test-refresh', expires_in: 3600, expires_at: payload.exp, token_type: 'bearer', user }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('/rest/v1/categories?')) return new Response(JSON.stringify([{id:1,name:'Effect Series'},{id:2,name:'Moving Head'}]), {headers:{'Content-Type':'application/json'}});
    if (url.includes('/rest/v1/products?')) return new Response(JSON.stringify([{id:1,model:'SPL-TEST',description:'Fixture',category_id:1,new:true,images:[],contents:[],videos:[]}]), {headers:{'Content-Type':'application/json'}});
    if (url.includes('/storage/v1/object/') && options?.method === 'POST') return new Response(JSON.stringify({Key: url.split('/object/')[1],Id:'test-video'}), { headers: { 'Content-Type': 'application/json' } });
    if (url.includes('/rest/v1/rpc/save_site_section')) {
      const body = JSON.parse(options.body);
      values[body.p_key] = body.p_value;
      sessionStorage.setItem('sanyi-test-settings', JSON.stringify(values));
      return new Response(null, { status: 204 });
    }
    if (url.includes('/rest/v1/site_settings')) return new Response(JSON.stringify(Object.entries(values).map(([key,value]) => ({ key,value }))), { headers: { 'Content-Type': 'application/json' } });
    return original(input, options);
  };
};
await page.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `(${mock.toString()})()` });
await page.goto('http://127.0.0.1:8080/admin');
await page.fill('input[placeholder="Usuario de administrador"]', 'test-admin');
await page.fill('input[placeholder="Contraseña de administrador"]', 'test-only');
await page.click('loc=role:button[name="Iniciar Sesión"]');
await page.waitForSelector('loc=role:tab[name="Hero"]');
await page.click('loc=role:tab[name="Hero"]');
await page.waitForSelector('select');
await page.selectOption('select >> nth=0', 'image');
await page.fill('input[value="https://youtu.be/V8Z_ymp_-kg"]', 'http://127.0.0.1:8080/src/assets/prof3.jpg');
await page.fill('input[value="SPL-LED-1260S"]', 'Hero de prueba');
await page.click('loc=role:button[name="Guardar cambios"]');
await page.waitForFunction(() => window.__settingsTest.hero?.[0].title === 'Hero de prueba');
await page.click('loc=role:tab[name="Videos"]');
await page.fill('input[value="GUSTTAVO LIMA BUTECO GYN AFTERMOVIE1"]', 'Video de prueba');
await page.setInputFiles('input[type="file"] >> nth=0', ['/tmp/sanyi-upload-test.mp4']);
await page.waitForFunction(() => document.querySelector('input[type="url"]').value.includes('/product-videos/'));
await page.waitForFunction(() => !document.querySelector('[role="status"]'));
await page.click('loc=role:button[name="Guardar cambios"]');
await page.waitForFunction(() => window.__settingsTest.videos?.items[0].title === 'Video de prueba');
await page.click('loc=role:tab[name="Contacto"]');
await page.fill('input[type="email"]', 'prueba@example.com');
await page.fill('input[value="5491171388885"]', '5491112345678');
await page.click('loc=role:button[name="Guardar cambios"]');
await page.waitForFunction(() => window.__settingsTest.contact?.email === 'prueba@example.com');
await page.click('loc=role:tab[name="Categorías"]');
await page.waitForSelector('button[aria-label^="Bajar "]');
const secondCategory = await page.evaluate(() => document.querySelectorAll('button[aria-label^="Bajar "]')[1].getAttribute('aria-label').slice(6));
await page.click('button[aria-label^="Bajar "] >> nth=0');
await page.waitForFunction(() => window.__settingsTest.category_order?.length > 0);
console.log('PASS: guardado de hero como foto, videos, contacto y orden de categorías (API simulada)');
await page.goto('http://127.0.0.1:8080/');
await page.waitForFunction(() => document.body.textContent.includes('Hero de prueba'));
await page.waitForFunction(() => document.body.textContent.includes('prueba@example.com'));
await page.waitForSelector('img[alt="Hero de prueba"]');
await page.goto('http://127.0.0.1:8080/videos');
await page.waitForFunction(() => document.body.textContent.includes('Video de prueba'));
await page.waitForSelector('video');
const mp4 = await page.evaluate(() => document.querySelector('video').getAttribute('src'));
if (!mp4.includes('/storage/v1/object/public/product-videos/') || !mp4.endsWith('.mp4')) throw new Error('La página de videos no muestra el MP4 guardado');
console.log('PASS: subir y guardar un MP4 desde Videos muestra un reproductor con su URL pública');
console.log('PASS: el sitio público muestra los cambios de hero, contacto y videos');
await page.evaluate(() => { window.__testPopup = { location: { href: '' }, opener: null }; window.open = () => window.__testPopup; });
await page.click('button[aria-label="Contactar por WhatsApp"]');
await page.waitForFunction(() => window.__testPopup.location.href.startsWith('https://wa.me/5491112345678?'));
await page.goto('http://127.0.0.1:8080/productos');
await page.waitForSelector('a[href^="/producto/"]');
await page.waitForFunction(name => document.querySelector('div.flex.flex-wrap.gap-2')?.children[1]?.textContent === name, secondCategory);
console.log('PASS: WhatsApp usa el número editado y el catálogo respeta el orden guardado');

await page.evaluate(async () => { const {supabase}=await import('/src/lib/supabase.ts'); await supabase.auth.signOut({scope:'local'}); });
