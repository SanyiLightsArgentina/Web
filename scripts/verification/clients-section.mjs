// Browser checks with an isolated Auth/settings/storage fixture. No live writes.
const task=await taskSpace('Sanyi clients verification');
const page=task.page('p1');
const mock = () => {
  const original = window.fetch.bind(window);
  const values = JSON.parse(sessionStorage.getItem('sanyi-client-test-settings') || '{}');
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
      if (window.__rejectClientSave) return new Response(JSON.stringify({message:'Test save failure'}), {status:500,headers:{'Content-Type':'application/json'}});
      const body = JSON.parse(options.body);
      values[body.p_key] = body.p_value;
      sessionStorage.setItem('sanyi-client-test-settings', JSON.stringify(values));
      return new Response(null, { status: 204 });
    }
    if (url.includes('/rest/v1/site_settings')) return new Response(JSON.stringify(Object.entries(values).map(([key,value]) => ({ key,value }))), { headers: { 'Content-Type': 'application/json' } });
    return original(input, options);
  };
};
await page.cdp('Page.addScriptToEvaluateOnNewDocument',{source:`(${mock.toString()})()`});
await page.goto('http://127.0.0.1:8080/admin');
await page.fill('input[placeholder="Usuario de administrador"]','test-admin');
await page.fill('input[placeholder="Contraseña de administrador"]','test-only');
await page.click('loc=role:button[name="Iniciar Sesión"]');
await page.click('loc=role:tab[name="Clientes"]');
await page.click('loc=role:button[name="Agregar empresa"]');
await page.fill('input[placeholder="Nombre de la empresa"]','Empresa de prueba A');
await page.fill('input[placeholder="https://empresa.com/logo.png"]','http://127.0.0.1:8080/src/assets/logo.png');
await page.fill('input[placeholder="https://empresa.com"]','https://example.com/cliente-a');
await page.click('loc=role:button[name="Agregar empresa"]');
await page.fill('input[placeholder="Nombre de la empresa"] >> nth=1','Empresa de prueba B');
await page.fill('input[placeholder="https://empresa.com"] >> nth=1','https://example.com/cliente-b');
await page.setInputFiles('input[type="file"] >> nth=1',['/Users/marcoshussey/Documents/Sandbox/sanyi/Web/src/assets/logo.png']);
await page.waitForFunction(()=>[...document.querySelectorAll('input[type="url"]')].some(i=>i.value.includes('/storage/v1/object/public/product-images/clients/')));
await page.click('button[aria-label="Subir empresa 2"]');
await page.waitForFunction(()=>!document.querySelector('[role="status"]'));
await page.click('loc=role:button[name="Guardar clientes"]');
await page.waitForFunction(()=>window.__settingsTest.clients?.[0].company === 'Empresa de prueba B');
console.log('PASS: editar empresas, subir logo, cargar links, reordenar y guardar');
await page.reload();
await page.click('loc=role:tab[name="Clientes"]');
await page.waitForFunction(()=>document.querySelector('input[placeholder="Nombre de la empresa"]')?.value === 'Empresa de prueba B');
await page.evaluate(()=>{window.__rejectClientSave=true;});
await page.fill('input[placeholder="Nombre de la empresa"] >> nth=0','Cambio sin guardar');
await page.click('loc=role:button[name="Guardar clientes"]');
await page.waitForFunction(()=>document.body.textContent.includes('No se pudieron guardar los clientes'));
if(await page.evaluate(()=>window.__settingsTest.clients[0].company) !== 'Empresa de prueba B') throw new Error('Se modificó la lista ante un error de guardado');
console.log('PASS: recargar conserva los datos; un fallo no borra los cambios del formulario');
await page.goto('http://127.0.0.1:8080/');
await page.waitForFunction(()=>document.querySelector('#clientes')?.textContent.includes('Empresa de prueba B'));
const actual=await page.evaluate(()=>[...document.querySelectorAll('#clientes li a')].map(a=>({name:a.textContent.trim(),href:a.getAttribute('href'),rel:a.rel})));
if(actual[0]?.name !== 'Empresa de prueba B' || actual[0]?.href !== 'https://example.com/cliente-b' || !actual[0]?.rel.includes('noopener')) throw new Error(JSON.stringify(actual));
console.log('PASS: el inicio refleja el orden y los links configurados');
await page.goto('http://127.0.0.1:8080/admin');
await page.click('loc=role:tab[name="Clientes"]');
await page.click('button[aria-label="Eliminar empresa 1"]');
await page.click('button[aria-label="Eliminar empresa 1"]');
await page.click('loc=role:button[name="Guardar clientes"]');
await page.waitForFunction(()=>window.__settingsTest.clients?.length === 0);
await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await page.goto('http://127.0.0.1:8080/');
await page.waitForSelector('a[href^="/producto/"]');
await page.waitForFunction(()=>document.querySelectorAll('#clientes li').length===4);
await page.evaluate(()=>window.scrollTo({top:document.getElementById('clientes').offsetTop-100,behavior:'instant'}));
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
if(overflow) throw new Error('Desbordamiento en móvil');
console.log('PASS: eliminar todos restaura cuatro placeholders; móvil sin desbordamiento');
console.log({screenshot:await page.screenshot({path:'/tmp/sanyi-clients-mobile.png'})});
await page.evaluate(async()=>{const {supabase}=await import('/src/lib/supabase.ts');await supabase.auth.signOut({scope:'local'});});
