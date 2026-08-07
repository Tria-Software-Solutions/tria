import { spawn } from 'child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9293;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-cdpVP', 'about:blank',
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error('no target');
}

const ws = new WebSocket(await getTarget());
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};

await new Promise((r) => (ws.onopen = r));
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1366, height: 768, deviceScaleFactor: 1, mobile: false,
});
await send('Page.navigate', { url: 'http://127.0.0.1:8099/quote' });
await sleep(2500);

const res = await send('Runtime.evaluate', {
  expression: `(() => {
    const wizard = document.querySelector('.tria-quote-wizard');
    const body = document.querySelector('.tria-quiz-step[data-step="1"] .tria-quiz-step-body');
    const nav = document.querySelector('.tria-quote-nav');
    const stepH = getComputedStyle(document.querySelector('.tria-quote-form')).getPropertyValue('--tria-step-h');
    const r = wizard.getBoundingClientRect();
    return {
      stepH: stepH.trim(),
      bodyH: body ? body.clientHeight : -1,
      wizardH: wizard ? wizard.offsetHeight : -1,
      navTop: nav ? Math.round(nav.getBoundingClientRect().top) : -1,
      wizardBottom: Math.round(r.bottom),
      viewportH: window.innerHeight,
      navBelowFold: nav ? nav.getBoundingClientRect().bottom > window.innerHeight : null,
    };
  })()`,
  returnByValue: true,
});
console.log('1366x768:', JSON.stringify(res.result.value));

ws.close();
chrome.kill();
process.exit(0);
