// Local browser regression; all database/storage writes are intercepted.
// Prerequisite: a small MP4 at /tmp/sanyi-upload-test.mp4 and npm run dev.
const task = await taskSpace('Sanyi MP4 upload verification');
const page = task.page('p1');
console.log({spaceId:task.spaceId});
const fixture = () => {
  const original = window.fetch.bind(window);
  window.__uploadTest = { failUpload: true, saves: [], uploads: [] };
  const json = (value, status=200) => new Response(JSON.stringify(value), {status, headers:{'Content-Type':'application/json'}});
  window.fetch = async (input, options) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes('/auth/v1/')) {
      const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'test-admin@panel.sanyilights.invalid', app_metadata: { role: 'admin', username: 'test-admin' }, user_metadata: {}, created_at: new Date().toISOString() };
      const payload = { sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now()/1000)+3600, iat: Math.floor(Date.now()/1000), app_metadata: user.app_metadata };
      const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode(payload)}.dGVzdA`;
      return new Response(JSON.stringify(url.includes('/logout') ? {} : url.includes('/user') ? user : { access_token: token, refresh_token: 'test-refresh', expires_in: 3600, expires_at: payload.exp, token_type: 'bearer', user }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('/rest/v1/categories?')) return json([{id:1,name:'Moving Head'}]);
    if (url.includes('/rest/v1/site_settings?')) return json([]);
    if (url.includes('/rest/v1/products')) {
      if (['POST','PATCH'].includes(options?.method)) {
        const product = JSON.parse(options.body);
        window.__uploadTest.saves.push(product);
        return json([{...product[0] || product,id:100}]);
      }
      return json([]);
    }
    if (url.includes('/storage/v1/object/') && options?.method === 'POST') {
      window.__uploadTest.uploads.push(url);
      if (window.__uploadTest.failUpload) return json({statusCode:'413',error:'Payload too large',message:'The object exceeded the maximum allowed size'},413);
      return json({Key:decodeURIComponent(url.split('/object/')[1]),Id:'test-file'});
    }
    return original(input, options);
  };
};
await page.cdp('Page.addScriptToEvaluateOnNewDocument',{source:`(${fixture.toString()})()`});
await page.goto('http://127.0.0.1:8080/admin');
await page.fill('input[placeholder="Usuario de administrador"]','test-admin');
await page.fill('input[placeholder="Contraseña de administrador"]','test-only');
await page.click('loc=role:button[name="Iniciar Sesión"]');
await page.click('loc=role:button[name="Agregar Producto"]');
await page.fill('#model','MP4-TEST');
await page.fill('#description','Prueba de carga MP4');
const chooserPromise = page.waitForFileChooser();
await page.click('text="Arrastra y suelta videos aquí"');
const chooser = await chooserPromise;
await chooser.setFiles('/tmp/sanyi-upload-test.mp4');
await page.waitForSelector('video');
await page.click('loc=role:button[name="Crear Producto"]');
await page.waitForFunction(() => window.__uploadTest.uploads.length > 0);
// Wait until the submit transaction has either saved or reported its failure.
await page.waitForFunction(() => window.__uploadTest.saves.length > 0 || document.querySelector('[role="alert"]') || document.body.textContent.includes('El producto no se guardó'));
const result = await page.evaluate(() => ({uploads:window.__uploadTest.uploads.length,saves:window.__uploadTest.saves.length,formOpen:!!document.querySelector('#model')}));
console.log(result);
if(result.saves !== 0 || !result.formOpen) throw new Error('Una subida MP4 fallida guarda el producto sin el video y cierra el formulario');
console.log('PASS: una carga MP4 fallida no guarda ni pierde el formulario');

await page.waitForFunction(() => !document.querySelector('[role="status"]'));
await page.evaluate(() => { window.__uploadTest.failUpload = false; });
await page.click('loc=role:button[name="Crear Producto"]');
await page.waitForFunction(() => window.__uploadTest.saves.length === 1);
const saved = await page.evaluate(() => window.__uploadTest.saves[0][0]);
if (!saved.videos?.[0]?.includes('/storage/v1/object/public/product-videos/') || !saved.videos[0].endsWith('.mp4')) throw new Error('No se guardó la URL pública del MP4');
console.log('PASS: reintentar conserva el archivo y guarda su URL pública');

await page.evaluate(async () => { const {supabase}=await import('/src/lib/supabase.ts'); await supabase.auth.signOut({scope:'local'}); });
