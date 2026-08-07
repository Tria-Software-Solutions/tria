import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9266;
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-cdpDead', '--window-size=1440,900', 'about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'));
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
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
await sleep(3000);
const result = await run(`(async function(){
  const click = (sel) => { const el = document.querySelector(sel); if (el) el.click(); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const measureGroup = (name) => {
    const group = document.querySelector('.tria-quote-group[data-group="' + name + '"]');
    if (!group) return null;
    const rect = group.getBoundingClientRect();
    const inner = group.querySelector('.tria-quote-pill-inner');
    const irect = inner ? inner.getBoundingClientRect() : null;
    return {
      groupWidth: Math.round(rect.width),
      pillW: irect ? Math.round(irect.width) : 0,
      pillH: irect ? Math.round(irect.height) : 0,
      gridCols: getComputedStyle(group.querySelector('.tria-quote-pills')).gridTemplateColumns
    };
  };
  // step 1 → webapp → step 2
  click('input[name="types"][value="webapp"]');
  click('#quote-next'); await wait(450);
  const s2 = {
    screens: measureGroup('screens'),
    complexity: measureGroup('complexity'),
  };
  // step 3
  click('input[name="screens"][value="s2"]');
  click('input[name="complexity"][value="standard"]');
  click('#quote-next'); await wait(450);
  const s3 = {
    users: measureGroup('users'),
    deadline: measureGroup('deadline'),
    design: measureGroup('design'),
  };
  // step 4
  click('input[name="users"][value="u2"]');
  click('input[name="deadline"][value="d2"]');
  click('input[name="design"][value="ds2"]');
  click('#quote-next'); await wait(450);
  const s4 = {
    integrations: measureGroup('integrations'),
  };
  return { s2, s3, s4 };
})()`);
console.log(JSON.stringify(result, null, 2));
chrome.kill();
