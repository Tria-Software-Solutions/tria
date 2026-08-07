import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9281;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--no-first-run',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/chrome-cdpH','--window-size=1440,900','about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try { const res = await fetch(`http://127.0.0.1:${PORT}/json/list`); const list = await res.json(); const page = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(300);
  }
  throw new Error('no page target');
}
const ws = new WebSocket(await getPageTarget());
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params })); });
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
await new Promise(r => ws.onopen = r);
const evalJs = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result ? r.result.value : undefined; };

await send('Page.enable');
await send('Runtime.enable');
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:8099/contact' });
await sleep(2500);

for (const w of [1440, 1366, 1280, 1199, 1024, 993]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(350);
  const m = await evalJs(`(() => {
    const left = document.querySelector('.tria-cf-main-row > .col-lg-8');
    const right = document.querySelector('.tria-cf-main-row > .col-lg-4');
    const form = document.querySelector('.tria-cf-form');
    const sidebar = document.querySelector('.tria-cf-sidebar');
    const ta = document.getElementById('cf-message');
    const cols = getComputedStyle(left.parentElement).display;
    return {
      left: Math.round(left.getBoundingClientRect().height),
      right: Math.round(right.getBoundingClientRect().height),
      form: Math.round(form.getBoundingClientRect().height),
      sidebar: Math.round(sidebar.getBoundingClientRect().height),
      textarea: Math.round(ta.getBoundingClientRect().height),
      diff: Math.round(right.getBoundingClientRect().height - left.getBoundingClientRect().height),
      layout: cols,
    };
  })()`);
  console.log(w + 'px', JSON.stringify(m));
}
chrome.kill();
