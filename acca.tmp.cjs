const { spawn } = require('child_process');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9336;
const PROFILE = process.env.TMPDIR + 'cdpa-' + Date.now();

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--window-size=1440,900', 'http://localhost:4321/services'
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

  // open first accordion
  await send('Runtime.evaluate', { expression: `document.querySelector('[data-accordion-toggle]').click(); true` });
  await sleep(1000);

  const s1 = await send('Runtime.evaluate', { expression: `(() => {
    const item = document.querySelector('.tria-tbl-item.is-open');
    const detail = item.querySelector('[data-accordion-panel]');
    const inner = detail.firstElementChild;
    const t = document.querySelector('.tria-tbl-toggle');
    const r1 = detail.getBoundingClientRect();
    const hasBug = [];
    // everything that is visible inside panel now
    document.querySelectorAll('.tria-tbl-item.is-open *').forEach(el => {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (c.display !== 'none' && c.visibility === 'visible' && r.height > 0) {
        const txt = (el.textContent || '').trim().slice(0, 40);
        if (txt) hasBug.push(el.tagName + ':' + txt);
      }
    });
    return JSON.stringify({ open: true, hasBug: hasBug.slice(0, 20), rows: getComputedStyle(detail).gridTemplateRows, vis: getComputedStyle(detail).visibility });
  })()`, returnByValue: true });
  console.log('OPEN STATE:', JSON.stringify(s1.result.value, null, 1));

  // close it
  await send('Runtime.evaluate', { expression: `document.querySelector('.tria-tbl-toggle').click(); true` });
  // sample over time
  for (const delay of [100, 300, 550, 700, 1200]) {
    await sleep(delay);
    const s = await send('Runtime.evaluate', { expression: `(() => {
      const detail = document.querySelector('.tria-tbl-detail:not(.is-open)') || document.querySelector('[data-accordion-panel]');
      const c = getComputedStyle(detail);
      const visTexts = [];
      const blocks = detail.querySelectorAll('p, h4, span');
      blocks.forEach(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (cs.visibility === 'visible' && r.height > 1) {
          visTexts.push(el.tagName + ':' + (el.textContent || '').trim().slice(0, 30) + ' h=' + Math.round(r.height));
        }
      });
      const item = document.querySelector('.tria-tbl-item');
      const el = detail.closest('.tria-tbl-item');
      return { t: ${delay}, rows: c.gridTemplateRows, vis: c.visibility, itemOpen: el.classList.contains('is-open'), visibleEls: visTexts.slice(0, 5) };
    })()`, returnByValue: true });
    console.log('CLOSE t=' + delay + 'ms:', JSON.stringify(s.result.value));
  }

  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });