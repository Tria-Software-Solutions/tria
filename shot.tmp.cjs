const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('#featLaptop', { timeout: 30000 });
  await page.waitForTimeout(6000);
  const meta = await page.evaluate(() => {
    const v = document.getElementById('featViewport');
    const f = document.getElementById('featFrame');
    const r = v.getBoundingClientRect();
    return { vw: r.width, vh: r.height, frameTransform: getComputedStyle(f).transform };
  });
  console.log(JSON.stringify(meta, null, 2));
  const el = await page.$('#featLaptop');
  await el.screenshot({ path: process.env.TMPDIR + 'laptop.png' });
  await browser.close();
})();