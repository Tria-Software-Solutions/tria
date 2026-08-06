const { spawn } = require('child_process');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9335;
const PROFILE = process.env.TMPDIR + 'cdp3-' + Date.now();

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

  await send('Runtime.evaluate', { expression: `document.getElementById('featLaptop').scrollIntoView({ block: 'center' }); true` });
  await send('Runtime.evaluate', { expression: `window.document.getElementsByTagName('html')[0].style.scrollBehavior='auto'` });
  await sleep(1000);

  const script = `(() => {
    const v = document.getElementById('featViewport');
    const f = document.getElementById('featFrame');
    const loader = document.getElementById('featLoader');
    const fall = document.getElementById('featFallback');
    const vr = v.getBoundingClientRect();
    const out = [];
    const state = (el, label) => {
      if (!el) { out.push({ label, missing: true }); return; }
      const c = getComputedStyle(el);
      const img = el.tagName === 'IMG' ? el.src : c.backgroundImage;
      out.push({ label, display: c.display, visibility: c.visibility, opacity: c.opacity, bg: c.backgroundColor, img: img.slice(0, 100), className: el.className });
    };
    state(loader, 'loader'); state(f, 'iframe'); state(fall, 'fallback');
    const fbimg = fall.querySelector('img');
    if (fbimg) { const r = fbimg.getBoundingClientRect(); out.push({ label: 'fallback-img-class', cls: fbimg.className, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, src: fbimg.src.slice(-60) }); }
    const probe = (label, y) => {
      const x = vr.left + vr.width / 2;
      const el = document.elementFromPoint(x, y);
      const chain = [];
      let e = el;
      while (e && chain.length < 8) {
        const c = getComputedStyle(e);
        const cls = typeof e.className === 'string' ? e.className.split(' ')[0] : '';
        chain.push(e.tagName + '#' + (e.id || '') + '.' + cls + ' bg=' + c.backgroundColor + ' op=' + c.opacity);
        e = e.parentElement;
      }
      out.push({ label, x, y, chain });
    };
    probe('bottom-band(-2px)', vr.bottom - 2);
    probe('bottom-band(-6px)', vr.bottom - 6);
    probe('mid', vr.top + vr.height / 2);
    return JSON.stringify(out, null, 1);
  })()`;

  const res = await send('Runtime.evaluate', { expression: script, returnByValue: true });
  console.log(res.result.value);
  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });