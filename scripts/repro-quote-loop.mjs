import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9269;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/chrome-cdpLoop','--window-size=1440,900','about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try { const res = await fetch(`http://localhost:${PORT}/json/list`); const list = await res.json(); const page = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(300);
  }
  throw new Error('no page target');
}
const ws = new WebSocket(await getPageTarget());
let id = 0; const pending = new Map(); const errors = [];
const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
ws.onerror = () => errors.push('ws error');
await new Promise(r => ws.onopen = r);
const evalJs = async (expr) => { try { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result ? r.result.value : undefined; } catch (e) { errors.push(String(e.message || e)); return null; } };

const navLog = [];
send('Page.enable');
send('Runtime.enable');
send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
ws.onmessage = null; // reset
const handlers = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return; }
  if (m.method === 'Page.frameNavigated' && m.params.frame.parentId === undefined) {
    navLog.push('frameNavigated: ' + m.params.frame.url);
  }
  if (m.method === 'Page.navigatedWithinDocument') {
    navLog.push('navigatedWithinDocument: ' + m.params.url);
  }
};
send('Page.enable');
send('Runtime.enable');

// 1) Go to /es/quote, set localStorage, reload
await send('Page.navigate', { url: 'http://localhost:8099/es/quote/' });
await sleep(3000);
await evalJs(`localStorage.setItem('tria-locale', 'es'); location.reload(); true`);
await sleep(3000);
const stored = await evalJs(`localStorage.getItem('tria-locale')`);
const url1 = await evalJs(`location.href`);

// 2) Click the CTA "Solicitar cotización exacta"
navLog.length = 0;
const clicked = await evalJs(`(() => {
  const cta = document.querySelector('.tria-quote-result-cta2');
  if (!cta) return 'no-cta';
  cta.click();
  return 'clicked';
})()`);
await sleep(6000);

const urlEnd = await evalJs(`location.href`);
const storedEnd = await evalJs(`localStorage.getItem('tria-locale')`);
const swupActive = await evalJs(`!!window.__swup`);

console.log(JSON.stringify({
  storedBefore: stored,
  urlAtClick: url1,
  clicked,
  swupActive,
  navLog,
  urlAfter: urlEnd,
  storedEnd
}, null, 2));
if (errors.length) console.log('ERRORS:', JSON.stringify(errors));
process.exit(0);
