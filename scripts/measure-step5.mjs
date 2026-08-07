import { spawn } from 'child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9286;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-cdpM5', 'about:blank',
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

const stepData = [];
for (let s = 1; s <= 5; s++) {
  if (s > 1) {
    // complete step s-1: click ALL radios/checkboxes, then Next (same pattern as verify-step5-final.mjs)
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('[data-step="${s - 1}"] input[type="radio"], [data-step="${s - 1}"] input[type="checkbox"]').forEach(i => i.click());`,
      returnByValue: true,
    });
    await sleep(250);
    await send('Runtime.evaluate', {
      expression: `(() => { const b = document.getElementById('quote-next'); if (!b || b.hidden) return 'no-btn'; if (b.classList.contains('is-blocked') || b.disabled) return 'blocked'; b.click(); return 'clicked'; })()`,
      returnByValue: true,
    });
    await sleep(500);
  }
  const res = await send('Runtime.evaluate', {
    expression: `(function(){
      const step = document.querySelector('.tria-quiz-step[data-step="${s}"]');
      const body = step.querySelector('.tria-quiz-step-body');
      const wizard = document.querySelector('.tria-quote-wizard');
      const result = document.getElementById('tria-quote-result');
      return {
        bodyH: body ? body.clientHeight : -1,
        bodyScroll: body ? body.scrollHeight : -1,
        overflow: body ? body.scrollHeight > body.clientHeight + 2 : null,
        wizard: wizard ? wizard.offsetHeight : -1,
        result: result ? result.offsetHeight : -1,
      };
    })()`,
    returnByValue: true,
  });
  const d = res.result.value;
  stepData.push({ step: s, bodyH: d.bodyH, bodyScroll: d.bodyScroll, overflow: d.overflow, wizard: d.wizard, result: d.result, diff: d.wizard - d.result });
  console.log(`step${s}: body=${d.bodyH} scroll=${d.bodyScroll} overflow=${d.overflow} wizard=${d.wizard} result=${d.result} diff=${d.wizard - d.result}`);
}

// After the loop we are on step 5 (active) — measure its body again
const final = await send('Runtime.evaluate', {
  expression: `(() => {
    const body = document.querySelector('.tria-quiz-step[data-step="5"] .tria-quiz-step-body');
    return {
      activeStep: document.querySelector('.tria-quiz-step.is-active')?.dataset.step,
      bodyH: body ? body.clientHeight : -1,
      bodyScroll: body ? body.scrollHeight : -1,
      overflow: body ? body.scrollHeight > body.clientHeight + 2 : null,
    };
  })()`,
  returnByValue: true,
});
const f = final.result.value;
stepData[4] = { step: 5, bodyH: f.bodyH, bodyScroll: f.bodyScroll, overflow: f.overflow, wizard: stepData[4].wizard, result: stepData[4].result, diff: stepData[4].diff };
console.log(`step5-active EN: body=${f.bodyH} scroll=${f.bodyScroll} overflow=${f.overflow} activeStep=${f.activeStep}`);

// Simulate a validation error on step 5 (EN) and re-check overflow
const err = await send('Runtime.evaluate', {
  expression: `(() => {
    const p = document.getElementById('quote-contact-error');
    if (!p) return null;
    p.textContent = 'Please enter a valid email address';
    const body = document.querySelector('.tria-quiz-step[data-step="5"] .tria-quiz-step-body');
    return { bodyScroll: body.scrollHeight, bodyH: body.clientHeight, overflow: body.scrollHeight > body.clientHeight + 2 };
  })()`,
  returnByValue: true,
});
console.log('step5 EN with error:', JSON.stringify(err.result.value));

// Now ES — walk to step 5 and check overflow with and without error
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
const es = await send('Runtime.evaluate', {
  expression: `(() => {
    const body = document.querySelector('.tria-quiz-step[data-step="5"] .tria-quiz-step-body');
    const p = document.getElementById('quote-contact-error');
    p.textContent = 'Por favor ingresa un email válido';
    const withErr = body.scrollHeight;
    return {
      bodyH: body.clientHeight, bodyScroll: body.scrollHeight,
      overflowNoErr: null, overflowWithErr: withErr > body.clientHeight + 2,
      activeStep: document.querySelector('.tria-quiz-step.is-active')?.dataset.step,
    };
  })()`,
  returnByValue: true,
});
console.log('step5 ES with error:', JSON.stringify(es.result.value));

const bodies = stepData.map((d) => d.bodyH);
console.log('bodies:', bodies.join(','));
console.log('all equal:', new Set(bodies).size === 1);
console.log('step5 scrolls:', stepData[4].overflow);

ws.close();
chrome.kill();
process.exit(0);
