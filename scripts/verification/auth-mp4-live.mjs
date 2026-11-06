// First run: node scripts/verification/auth-mp4-fixture.mjs setup
// Then run this with ego-browser; finally run the fixture script with cleanup.
// Requires a small playable MP4 at /tmp/sanyi-upload-test.mp4 and the local dev server.
const fixture=JSON.parse(await (await import('node:fs/promises')).readFile('/tmp/sanyi-auth-live-fixture.json','utf8'));
const task=await taskSpace('Sanyi MP4 upload verification');
const page=await task.newPage();
console.log({page:page.label});
await page.goto('http://127.0.0.1:8080/admin');
await page.fill('input[placeholder="Usuario de administrador"]',fixture.username);
await page.fill('input[placeholder="Contraseña de administrador"]',fixture.password);
await page.click('loc=role:button[name="Iniciar Sesión"]');
await page.waitForSelector('loc=role:button[name="Agregar Producto"]');
console.log('PASS: login real con usuario y contraseña');
await page.reload();
await page.waitForSelector('loc=role:button[name="Agregar Producto"]');
console.log('PASS: la sesión sobrevive a la recarga');
await page.click('loc=role:button[name="Agregar Producto"]');
await page.fill('#model',fixture.model);
await page.fill('#description','Verificación temporal de carga y reproducción MP4');
const chooserPromise=page.waitForFileChooser();
await page.click('text="Arrastra y suelta videos aquí"');
await (await chooserPromise).setFiles('/tmp/sanyi-upload-test.mp4');
await page.waitForSelector('video');
await page.click('loc=role:button[name="Crear Producto"]');
await page.waitForFunction(()=> !document.querySelector('#model'));
await page.goto(`http://127.0.0.1:8080/producto/${encodeURIComponent(fixture.model)}`);
await page.waitForSelector('video');
await page.waitForFunction(()=> [...document.querySelectorAll('video')].some(v=>v.readyState>=1 && v.duration>0));
const video=await page.evaluate(()=>{const v=document.querySelector('video');return{url:v.currentSrc,duration:v.duration,error:v.error?.code??null};});
if(!video.url.includes('/product-videos/') || video.error || video.duration<0.9) throw new Error(JSON.stringify(video));
console.log({mp4SavedAndPlayable:true,duration:video.duration});
await page.goto('http://127.0.0.1:8080/admin');
await page.waitForSelector('loc=role:button[name="Cerrar Sesión"]');
await page.click('loc=role:button[name="Cerrar Sesión"]');
await page.waitForSelector('input[placeholder="Usuario de administrador"]');
await page.reload();
await page.waitForSelector('input[placeholder="Usuario de administrador"]');
console.log('PASS: cerrar sesión elimina el acceso persistente');
console.log(await page.snapshot());
