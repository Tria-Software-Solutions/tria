import { spawn } from 'child_process';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9287;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox','--no-first-run',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/chrome-cdpQ','--window-size=1440,900','about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getTarget() { for (let i = 0; i < 40; i++) { try { const l = await (await fetch('http://127.0.0.1:'+PORT+'/json/list')).json(); const p = l.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')); if (p) return p.webSocketDebuggerUrl; } catch {} await sleep(300); } throw new Error('no target'); }
const ws = new WebSocket(await getTarget());
let id = 0; const pending = new Map();
const send = (m, p={}) => new Promise((res, rej) => { const i = ++id; pending.set(i, {res, rej}); ws.send(JSON.stringify({id: i, method: m, params: p})); });
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
await new Promise(r => ws.onopen = r);
const evalJs = async (e) => { try { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result ? r.result.value : null; } catch { return null; } };

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8099/quote' });
await sleep(2500);

async function measure(label) {
  const m = await evalJs(`(() => {
    const wiz = document.querySelector('.tria-quote-wizard');
    const res = document.querySelector('.tria-quote-result');
    const body = document.querySelector('.tria-quiz-step.is-active > .tria-quiz-step-body');
    const nav = document.querySelector('.tria-quote-nav');
    const submit = document.getElementById('quote-submit');
    return {
      wizard: Math.round(wiz.getBoundingClientRect().height),
      result: Math.round(res.getBoundingClientRect().height),
      body: Math.round(body.getBoundingClientRect().height),
      navTop: Math.round(nav.getBoundingClientRect().top),
      navH: Math.round(nav.getBoundingClientRect().height),
      submitVisible: submit ? !submit.hidden : null,
      diff: Math.round(res.getBoundingClientRect().height - wiz.getBoundingClientRect().height),
    };
  })()`);
  console.log(label, JSON.stringify(m));
}

await measure('step1:');

// Complete step 1 (click a type card), then walk 2-4
await evalJs(`document.querySelectorAll('[data-step="1"] input[type="radio"], [data-step="1"] input[type="checkbox"]').forEach(i => { const g = i.closest('.tria-quote-group, .tria-quote-features, .tria-quiz-step-body'); if (!g || !g.hidden) i.click(); });`);
await sleep(250);
const next1 = await evalJs(`(() => { const b = document.getElementById('quote-next'); if (!b || b.hidden) return 'hidden'; if (b.classList.contains('is-blocked') || b.disabled) return 'blocked'; b.click(); return 'clicked'; })()`);
if (next1 !== 'clicked') { console.log('next blocked at step 1:', next1); chrome.kill(); process.exit(1); }
await sleep(400);

// Walk steps 2-4 (click first visible radio/checkbox per step, then next)
for (let step = 2; step <= 4; step++) {
  await evalJs(`document.querySelectorAll('[data-step="${step}"] input[type="radio"], [data-step="${step}"] input[type="checkbox"]').forEach(i => { const g = i.closest('.tria-quote-group, .tria-quote-features, .tria-quiz-step-body'); if (!g || !g.hidden) i.click(); });`);
  await sleep(250);
  const next = await evalJs(`(() => { const b = document.getElementById('quote-next'); if (!b || b.hidden) return 'hidden'; if (b.classList.contains('is-blocked') || b.disabled) return 'blocked'; b.click(); return 'clicked'; })()`);
  if (next !== 'clicked') { console.log('next blocked at step', step, next); break; }
  await sleep(400);
}
await sleep(400);
await measure('step5:');
chrome.kill();
