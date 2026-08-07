// Reproduce the /services "view more" close glitch and measure the animation.
import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9279;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--no-first-run',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/chrome-cdpSvc','--window-size=1440,900','about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'));
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { if (i % 5 === 0) console.log('fetch err', i, e.message); }
    await sleep(300);
  }
  throw new Error('no page target');
}
const ws = new WebSocket(await getPageTarget());
let id = 0; const pending = new Map(); const errors = [];
const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
await new Promise(r => ws.onopen = r);
const evalJs = async (expr) => { try { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) { errors.push('EXC: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text || '').slice(0, 200)); return null; } return r.result ? r.result.value : undefined; } catch (e) { errors.push(String(e.message || e)); return null; } };

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8099/services' });
await sleep(2500); // let swup + i18n settle

const setup = await evalJs(`(() => {
  const items = [...document.querySelectorAll('.tria-tbl-item')];
  const first = items[0];
  if (!first) return { error: 'no items', count: items.length };
  first.querySelector('[data-accordion-toggle]').click(); // open
  return { count: items.length };
})()`);
console.log('setup:', JSON.stringify(setup));
await sleep(800); // wait for open animation

const before = await evalJs(`(() => {
  const item = document.querySelector('.tria-tbl-item');
  const d = item.querySelector('.tria-tbl-detail');
  const inner = item.querySelector('.tria-tbl-detail-inner');
  const ov = item.querySelector('.tria-tbl-overview');
  return { detailH: Math.round(d.getBoundingClientRect().height), innerH: Math.round(inner.getBoundingClientRect().height),
           overviewPars: ov ? ov.querySelectorAll('p').length : 0 };
})()`);
console.log('before close:', JSON.stringify(before));

await evalJs(`document.querySelector('.tria-tbl-item [data-accordion-toggle]').click()`);

const samples = [];
for (let i = 0; i <= 14; i++) {
  await sleep(50);
  const s = await evalJs(`(() => {
    const item = document.querySelector('.tria-tbl-item');
    const d = item.querySelector('.tria-tbl-detail');
    const inner = item.querySelector('.tria-tbl-detail-inner');
    const vis = getComputedStyle(d).visibility;
    const rInner = inner.getBoundingClientRect();
    const ov = item.querySelector('.tria-tbl-overview');
    const pars = ov ? [...ov.querySelectorAll('p')] : [];
    const visiblePars = pars.filter(p => { const r = p.getBoundingClientRect(); return r.bottom > rInner.top && r.top < rInner.bottom; }).length;
    return { t: ${i * 50}, detailH: Math.round(d.getBoundingClientRect().height * 10) / 10,
             innerH: Math.round(rInner.height * 10) / 10, vis, visiblePars };
  })()`);
  samples.push(s);
}
console.log('close samples:');
samples.forEach(s => console.log(JSON.stringify(s)));

const end = await evalJs(`(() => {
  const item = document.querySelector('.tria-tbl-item');
  const d = item.querySelector('.tria-tbl-detail');
  const inner = item.querySelector('.tria-tbl-detail-inner');
  return { isOpen: item.classList.contains('is-open'), detailH: Math.round(d.getBoundingClientRect().height), innerH: Math.round(inner.getBoundingClientRect().height), vis: getComputedStyle(d).visibility };
})()`);
console.log('after close (t=750):', JSON.stringify(end));
console.log('errors:', JSON.stringify(errors));
chrome.kill();
