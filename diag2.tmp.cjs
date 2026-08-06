const { spawn } = require('child_process');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const PROFILE = process.env.TMPDIR + 'cdp2-' + Date.now();

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--window-size=1440,900', 'http://localhost:4321/'
], { stdio: 'ignore' });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getTarget() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(500);
  }
  throw new Error('no target');
}

(async () => {
  const wsUrl = await getTarget();
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending[mid] = { resolve, reject };
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending[msg.id]) {
      pending[msg.id].resolve(msg.result);
      delete pending[msg.id];
    }
  };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(9000);

  const script = `(() => {
    const v = document.getElementById('featViewport');
    const f = document.getElementById('featFrame');
    const l = document.getElementById('featLaptop');
    const vr = v.getBoundingClientRect();
    const out = [];
    // hit-test points along the bottom band of the screen area
    const probe = (label, y) => {
      const x = vr.left + vr.width / 2;
      const el = document.elementFromPoint(x, y);
      const chain = [];
      let e = el;
      while (e && e !== document.body && chain.length < 8) {
        const c = getComputedStyle(e);
        chain.push(e.tagName + '#' + (e.id || '') + '.' + (typeof e.className === 'string' ? e.className.split(' ')[0] : '') + ' bg=' + c.backgroundColor + ' op=' + c.opacity);
        e = e.parentElement;
      }
      out.push({ label, x, y, chain });
    };
    probe('just-above-viewport-bottom', vr.bottom - 2);
    probe('middle-band', vr.bottom - vr.height / 2);
    probe('halfway-up', vr.bottom - vr.height * 0.4);
    // check iframe internals
    try {
      const idoc = f.contentDocument;
      if (idoc) {
        const b = idoc.body;
        const cs = getComputedStyle(b);
        out.push({ iframeDoc: { bodyBg: cs.backgroundColor, bodyH: b.scrollHeight, htmlH: idoc.documentElement.scrollHeight, title: idoc.title, url: idoc.location.href } });
      } else out.push({ iframeDoc: null });
    } catch (err) { out.push({ iframeDoc: 'ERR ' + err.message }); }
    // screenshot of the viewport region as base64 for pixel analysis later
    const c = document.createElement('canvas');
    return JSON.stringify(out, null, 1);
  })()`;

  const res = await send('Runtime.evaluate', { expression: script, returnByValue: true });
  console.log(res.result.value);
  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });