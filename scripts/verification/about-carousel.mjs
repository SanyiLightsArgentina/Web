// Run: ego-browser nodejs < scripts/verification/about-carousel.mjs
const task = await taskSpace('Sanyi about carousel verification');
const page = task.page('p1');
const titles = ['Iluminación Profesional', 'Tecnología Avanzada', 'Solicita Asesoramiento', 'Distribuidor Oficial'];

await page.cdp('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });
await page.goto('http://127.0.0.1:8080/about');
await page.waitForSelector('img[alt="Iluminación Profesional"]');

// The first slide must be the responsive small variant, and the remaining
// slides must still load in the background so the carousel keeps working.
const first = await page.evaluate(() => {
  const image = document.querySelector('img[alt="Iluminación Profesional"]');
  return { src: image.currentSrc, width: image.naturalWidth, complete: image.complete };
});
if (!first.complete || !first.src.endsWith('-800.webp') || first.width !== 800) throw new Error(`Primera imagen inesperada: ${JSON.stringify(first)}`);

await page.waitForFunction(() => {
  const titles = ['Iluminación Profesional', 'Tecnología Avanzada', 'Solicita Asesoramiento', 'Distribuidor Oficial'];
  const images = [...document.images].filter(image => titles.includes(image.alt));
  return images.length === titles.length && images.every(image => image.complete && image.naturalWidth > 0);
});

const loaded = await page.evaluate(() => ['Iluminación Profesional', 'Tecnología Avanzada', 'Solicita Asesoramiento', 'Distribuidor Oficial']
  .map(alt => {
    const image = document.querySelector(`img[alt="${alt}"]`);
    return { alt, src: image.currentSrc.split('/').pop(), width: image.naturalWidth };
  }));
if (loaded.some(image => !image.src.endsWith('.webp'))) throw new Error(`Variante no WebP: ${JSON.stringify(loaded)}`);

// The manual controls still advance the carousel after the lazy load.
await page.click('loc=role:button[name="2"]');
await page.waitForFunction(() => document.querySelector('h2').textContent.includes('Tecnología Avanzada'));
const advanced = await page.evaluate(() => !!document.querySelector('img[alt="Tecnología Avanzada"]'));
if (!advanced) throw new Error('La segunda diapositiva no se muestra');

// A retina desktop must receive the large variant instead of the 800px one.
await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
await page.goto('http://127.0.0.1:8080/about');
await page.waitForSelector('img[alt="Iluminación Profesional"]');
const retina = await page.evaluate(() => {
  const image = document.querySelector('img[alt="Iluminación Profesional"]');
  return { src: image.currentSrc, width: image.naturalWidth, complete: image.complete };
});
if (!retina.complete || !retina.src.endsWith('-2400.webp') || retina.width < 1400) throw new Error(`Variante retina inesperada: ${JSON.stringify(retina)}`);

console.log({ first, loaded, advanced, retina, pass: true });
