#!/usr/bin/env node
/**
 * upload-confluence.mjs
 * ─────────────────────
 * Sube todos los documentos de docs/confluence/ a Confluence Cloud como
 * páginas (página raíz + una página hija por documento).
 *
 * REQUISITOS (env vars — copiar de .env.example):
 *   CONFLUENCE_SITE       e.g. "triacr"            (tu <site>.atlassian.net)
 *   CONFLUENCE_EMAIL      e.g. "luis@triacr.com"   (tu email de Atlassian)
 *   CONFLUENCE_API_TOKEN  token de API (https://id.atlassian.com/manage-profile/security/api-tokens)
 *   CONFLUENCE_SPACE_KEY  e.g. "TRIA"  (clave del espacio — se crea si no existe)
 *
 * USO:
 *   node scripts/upload-confluence.mjs            # sube todo
 *   node scripts/upload-confluence.mjs --dry-run  # solo muestra lo que haría
 *   node scripts/upload-confluence.mjs --only 04  # solo un documento
 *
 * NOTAS:
 *   • Markdown → HTML básico (encabezados, tablas, listas, negritas, links,
 *     blockquotes, código, HTML ya existente se pasa tal cual).
 *   • No borra nada: si la página ya existe se salta (o --force la actualiza).
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const DOCS_DIR = new URL('../docs/confluence/', import.meta.url).pathname;
const SITE = process.env.CONFLUENCE_SITE || '';
const EMAIL = process.env.CONFLUENCE_EMAIL || '';
const TOKEN = process.env.CONFLUENCE_API_TOKEN || '';
const SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY || 'TRIA';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i !== -1 ? process.argv[i + 1] : null;
})();

if (!SITE || !EMAIL || !TOKEN) {
  console.error(`
❌ Faltan variables de entorno. Exporta:
  export CONFLUENCE_SITE="triacr"
  export CONFLUENCE_EMAIL="tu@email.com"
  export CONFLUENCE_API_TOKEN="tu-token"
  export CONFLUENCE_SPACE_KEY="TRIA"
`);
  process.exit(1);
}

const API = `https://${SITE}.atlassian.net/wiki/api/v2`;
const AUTH = 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      Authorization: AUTH,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) {
    const err = new Error(`API ${res.status} ${opts.method || 'GET'} ${path}: ${text.slice(0, 300)}`);
    err.status = res.status;
    err.json = json;
    throw err;
  }
  return json;
}

/* ── Markdown → HTML (básico pero suficiente para nuestros docs) ── */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  if (typeof s !== 'string') return '';
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip separator lines inside tables (handled by table block below)
    if (/^\s*\|?\s*[-:| ]+\s*\|?\s*$/.test(line) && !line.includes(':--') && !line.includes('--:')) {
      // possible table separator — handled when a table starts
    }

    // HTML passthrough (membrete uses raw <table> / <div>)
    if (/^\s*<(table|div)\b/.test(line)) {
      const block = [line];
      while (i + 1 < lines.length && !/^\s*<\/(table|div)>/.test(lines[i + 1]) && !/^\s*<(table|div)\s/.test(lines[i + 1])) {
        block.push(lines[i + 1]);
        i++;
      }
      // consume closing tag if present on next line
      if (i + 1 < lines.length && /^\s*<\/(table|div)>/.test(lines[i + 1])) { block.push(lines[i + 1]); i++; }
      out.push(block.join('\n'));
      i++;
      continue;
    }

    // Code fence
    if (/^\s*```/.test(line)) {
      const block = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { block.push(lines[i]); i++; }
      i++; // closing fence
      out.push('<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">text</ac:parameter><ac:plain-text-body><![CDATA[' +
        block.join('\n') + ']]></ac:plain-text-body></ac:structured-macro>');
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr/>');
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const block = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        block.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push('<blockquote>' + inline(block.join(' ')) + '</blockquote>');
      continue;
    }

    // Table
    if (/^\s*\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      // A separator row contains only pipes, dashes and colons (e.g. | --- | :--: |)
      if (rows.length >= 2 && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(rows[1])) {
        // second row is separator
        const body = rows.slice(2);
        const parseRow = (r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
        const headCells = parseRow(rows[0]).map(inline);
        out.push('<table><tbody>');
        out.push('<tr>' + headCells.map((c) => `<th>${c}</th>`).join('') + '</tr>');
        for (const r of body) {
          out.push('<tr>' + parseRow(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
        }
        out.push('</tbody></table>');
        continue;
      }
      // not a real table — fall through to list/paragraph
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const block = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        block.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>' + block.map((li) => `<li>${inline(li)}</li>`).join('') + '</ul>');
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const block = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        block.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + block.map((li) => `<li>${inline(li)}</li>`).join('') + '</ol>');
      continue;
    }

    // Empty line
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Paragraph (accumulate consecutive text lines)
    const para = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) &&
           !/^#{1,6}\s/.test(lines[i]) && !/^\s*\|/.test(lines[i]) &&
           !/^\s*>/.test(lines[i]) && !/^\s*```/.test(lines[i]) &&
           !/^\s*(table|div)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push('<p>' + inline(para.join(' ')) + '</p>');
  }

  return out.join('\n');
}

/* ── Confluence helpers ── */
async function findOrCreateSpace() {
  try {
    const res = await api(`/spaces?keys=${encodeURIComponent(SPACE_KEY)}`);
    if (res.results && res.results.length) return res.results[0];
  } catch (e) { /* 404-ish → create below */ }
  if (DRY_RUN) { console.log(`  (dry) crear espacio ${SPACE_KEY}`); return { id: 'DRY' }; }
  const created = await api('/spaces', {
    method: 'POST',
    // Nota: la API v2 de Confluence rechaza `description` en POST /spaces
    // ("Representation cannot be null") — el espacio se crea sin descripción
    // y puede editarse después desde la UI.
    body: JSON.stringify({ key: SPACE_KEY, name: `tria — ${SPACE_KEY} Docs` }),
  });
  return created;
}

async function findPageByTitle(spaceId, title, parentId) {
  let url = `/pages?space-id=${spaceId}&title=${encodeURIComponent(title)}&limit=25`;
  if (parentId) url += `&parent-id=${parentId}`;
  try {
    const res = await api(url);
    return res.results && res.results.length ? res.results[0] : null;
  } catch {
    return null;
  }
}

async function createPage(spaceId, title, html, parentId) {
  if (DRY_RUN) {
    console.log(`  (dry) ${title}`);
    return { id: 'DRY' };
  }
  const existing = await findPageByTitle(spaceId, title, parentId);
  if (existing && !FORCE) {
    console.log(`  ⏭  ya existe: ${title} (skipped — usa --force para actualizar)`);
    return existing;
  }
  const payload = {
    spaceId,
    status: 'current',
    title,
    body: { representation: 'storage', value: html },
  };
  if (parentId) payload.parentId = parentId;
  if (existing && FORCE) {
    const upd = await api(`/pages/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    console.log(`  ↻ actualizada: ${title}`);
    return upd;
  }
  const created = await api('/pages', { method: 'POST', body: JSON.stringify(payload) });
  console.log(`  ✓ ${title}`);
  return created;
}

/* ── Main ── */
async function main() {
  console.log(`\n📚 Subiendo docs de ${DOCS_DIR} → ${SITE}.atlassian.net (espacio ${SPACE_KEY})\n`);

  const files = readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md') && f !== '_membrete.md' && f !== 'README.md')
    .sort((a, b) => {
      const na = parseInt(a, 10) || 0;
      const nb = parseInt(b, 10) || 0;
      return na - nb || a.localeCompare(b);
    })
    .filter((f) => !ONLY || f.startsWith(ONLY));

  console.log(`📄 ${files.length} documento(s) detectado(s):\n  ${files.join('\n  ')}\n`);

  const space = await findOrCreateSpace();
  if (space.id === 'DRY') { console.log('\n(dry-run — no se subió nada)\n'); return; }

  // Root page from README index
  const readmePath = join(DOCS_DIR, 'README.md');
  const readmeTitle = `tria — Índice / Corporate Docs`;
  if (readFileSync(readmePath, 'utf8')) {
    await createPage(space.id, readmeTitle, mdToHtml(readFileSync(readmePath, 'utf8')));
  }

  // Find the root page id to nest children under it
  let rootId = null;
  try {
    const res = await api(`/pages?space-id=${space.id}&title=${encodeURIComponent(readmeTitle)}&limit=5`);
    if (res.results && res.results.length) rootId = res.results[0].id;
  } catch { rootId = null; }

  // One page per document
  for (const f of files) {
    const content = readFileSync(join(DOCS_DIR, f), 'utf8');
    // Title from first heading, fallback to filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/[#*]/g, '').trim() : basename(f, '.md');
    await createPage(space.id, title, mdToHtml(content), rootId || undefined);
  }

  console.log('\n✅ Listo. Revisa tu espacio:');
  console.log(`   https://${SITE}.atlassian.net/wiki/spaces/${SPACE_KEY}\n`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
