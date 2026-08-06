const { execFileSync, spawn } = require('child_process');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const PROFILE = process.env.TMPDIR + 'cdp-profile-' + Date.now();

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
    const out = [];
    const v = document.getElementById('featViewport');
    const f = document.getElementById('featFrame');
    const laptop = document.getElementById('featLaptop');
    const vr = v.getBoundingClientRect();
    const lr = laptop.getBoundingClientRect();
    const cs = s => { const c = getComputedStyle(s); return { bg: c.backgroundColor, display: c.display, opacity: c.opacity, transform: c.transform }; };
    out.push({ label: 'laptop', rect: { x: lr.x, y: lr.y, w: lr.width, h: lr.height } });
    out.push({ label: 'viewport', rect: { x: vr.x, y: vr.y, w: vr.width, h: vr.height }, ...cs(v) });
    out.push({ label: 'iframe', rect: { x: f.getBoundingClientRect().x, y: f.getBoundingClientRect().y, w: f.getBoundingClientRect().width, h: f.getBoundingClientRect().height }, ...cs(f) });
    // bottom edge of screen area: probe elements whose rects intersect the bottom 3px band
    const bandY = vr.bottom - 3;
    document.querySelectorAll('#featLaptop *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.top < bandY && r.bottom > bandY && r.left < vr.right && r.right > vr.left) {
        const c = getComputedStyle(el);
        if (c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none') {
          out.push({ label: el.tagName + '.' + (el.className || '').toString().split(' ')[0], rect: { x: r.x, y: r.y, w: r.width, h: r.height }, bg: c.backgroundColor, img: c.backgroundImage.slice(0, 80), z: c.zIndex, pos: c.position });
        }
      }
    });
    const img = document.querySelector('.tria-feat-laptop-frame');
    const ir = img.getBoundingClientRect();
    out.push({ label: 'laptop-frame img', rect: { x: ir.x, y: ir.y, w: ir.width, h: ir.height } });
    return JSON.stringify(out, null, 1);
  })()`;

  const res = await send('Runtime.evaluate', { expression: script, returnByValue: true });
  console.log(res.result.value);
  ws.close();
  chrome.kill();
  fs.rmSync(PROFILE, { recursive: true, force: true });
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });