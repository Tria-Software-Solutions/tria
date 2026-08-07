import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9291;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-cdpQ', 'about:blank',
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
  width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false,
});
await send('Page.navigate', { url: 'http://127.0.0.1:8099/quote' });
await sleep(2500);

const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`/tmp/tria-quote/${name}.png`, Buffer.from(r.data, 'base64'));
  console.log('saved', name);
};

await shot('step1');

for (let s = 2; s <= 5; s++) {
  await send('Runtime.evaluate', {
    expression: `document.querySelectorAll('[data-step="${s - 1}"] input[type="radio"], [data-step="${s - 1}"] input[type="checkbox"]').forEach(i => i.click());`,
    returnByValue: true,
  });
  await sleep(250);
  await send('Runtime.evaluate', {
    expression: `(()=>{const b=document.getElementById('quote-next');if(b&&!b.hidden&&!b.classList.contains('is-blocked')){b.click();return 1}return 0})()`,
    returnByValue: true,
  });
  await sleep(500);
}
await shot('step5');

// also capture the ES page step 5
await send('Page.navigate', { url: 'http://127.0.0.1:8099/es/quote' });
await sleep(2200);
for (let s = 2; s <= 5; s++) {
  await send('Runtime.evaluate', {
    expression: `document.querySelectorAll('[data-step="${s - 1}"] input[type="radio"], [data-step="${s - 1}"] input[type="checkbox"]').forEach(i => i.click());`,
    returnByValue: true,
  });
  await sleep(250);
  await send('Runtime.evaluate', {
    expression: `(()=>{const b=document.getElementById('quote-next');if(b&&!b.hidden&&!b.classList.contains('is-blocked')){b.click();return 1}return 0})()`,
    returnByValue: true,
  });
  await sleep(500);
}
await shot('step5-es');

ws.close();
chrome.kill();
process.exit(0);
