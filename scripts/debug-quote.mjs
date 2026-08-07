import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9264;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/chrome-cdpDbg','--window-size=1440,900','about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try { const res = await fetch(`http://localhost:${PORT}/json/list`); const list = await res.json(); const page = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(300);
  }
  throw new Error('no page target');
}
const ws = new WebSocket(await getPageTarget());
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id; pending.set(mid, { resolve, reject });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
await new Promise(r => ws.onopen = r);
await send('Page.enable');
await send('Runtime.enable');
const run = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return { EXCEPTION: (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text).slice(0, 200) };
  return r.result.value;
};
await send('Page.navigate', { url: 'http://localhost:8099/quote/' });
await sleep(3500);
const info = await run(`({
  href: location.href,
  title: document.title,
  bodyLen: document.body ? document.body.innerHTML.length : -1,
  hasShell: !!document.querySelector('.tria-quote-shell'),
  hasSection: !!document.querySelector('#quote'),
  hasError: !!document.querySelector('.tria-error, .error-page, main.error'),
  textHead: (document.body ? document.body.innerText : '').slice(0, 300),
})`);
console.log(JSON.stringify(info, null, 2));
chrome.kill();
