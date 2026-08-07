# 12 · Guía Jira & Slack / Jira & Slack Working Guide

<table style="width:100%; border:none;">
<tr><td style="border:none;"><strong style="font-size:26px; letter-spacing:-0.02em;">tria<span style="color:#068e8c;">.</span></strong><br/><em>Tria Software Solutions</em></td>
<td style="border:none; text-align:right; font-size:12px; color:#444;">support@triacr.com · triacr.com</td></tr>
</table>

> **Regla de oro / Golden rule:** *El trabajo vive en Jira; la conversación vive en Slack. Si algo cambia el alcance, el estado o una fecha → va a Jira.* / *Work lives in Jira; conversation lives in Slack. If something changes scope, status, or dates → it goes in Jira.*

---

## Inglés / English

### Jira — Project Management

**Board per project:** `[CLIENT]-board`, columns: Backlog → To Do → In Progress → In Review → Done.

**Issue types:**
| Type | Use |
|------|-----|
| Epic | Large initiative spanning multiple sprints |
| Story | User-facing feature with acceptance criteria |
| Task | Non-user-facing work (infra, config, docs) |
| Bug | Defect with steps to reproduce |
| Sub-task | Decomposition of a story/task |

**Issue hygiene:**
- Every issue has: description (what/why), acceptance criteria, estimate, priority.
- Link issues: `relates to`, `blocks`, `is blocked by`.
- Update status before the daily check — Jira is the source of truth.
- Close bugs only when verified in the relevant environment.

**Sprint ceremony:**
- Sprint length: 2 weeks (default).
- Planning: Monday of sprint week 1.
- Review/Demo: last Friday.
- Retrospective: same day as demo.

**Priorities:**
| Priority | Meaning |
|----------|---------|
| Highest | Blocks launch / production outage |
| High | Blocks sprint goal |
| Medium | Important, not blocking |
| Low | Nice to have |

### Slack — Communication

**Channels:**
| Channel | Purpose |
|---------|---------|
| `#general` | Company-wide announcements |
| `#ventas-sales` | Leads, proposals, quotes |
| `#proyecto-[name]` / `#client-[name]` | Per-project work (with client if agreed) |
| `#engineering` | Technical discussion, RFCs |
| `#design` | UI/UX discussions |
| `#qa` | Testing coordination |
| `#random` | Watercooler |

**Guidelines:**
- Threads for any topic that generates >2 replies.
- Use `@channel` sparingly; prefer targeted mentions.
- Set status when away/deep work.
- For client projects: keep the client channel tidy — decisions summarized and linked to Jira.
- Don't send secrets/passwords in Slack (use the password manager).
- Videos > long text when explaining a UI bug (Loom).

### Jira ↔ Slack connection
- New issues assigned to you → notification in `#engineering`.
- Pull requests linked to Jira tickets → automatic link in the thread.
- Demo reminders in the project channel.

---

## Español / Spanish

### Jira — Gestión de Proyectos

**Tablero por proyecto:** `[CLIENTE]-tablero`, columnas: Backlog → Por Hacer → En Progreso → En Revisión → Hecho.

**Tipos de issue:**
| Tipo | Uso |
|------|-----|
| Épica | Iniciativa grande que abarca varios sprints |
| Historia | Feature orientada a usuario con criterios de aceptación |
| Tarea | Trabajo no orientado a usuario (infra, config, docs) |
| Bug | Defecto con pasos para reproducir |
| Sub-tarea | Descomposición de una historia/tarea |

**Higiene de issues:**
- Todo issue tiene: descripción (qué/por qué), criterios de aceptación, estimación, prioridad.
- Vincula issues: `relaciona con`, `bloquea`, `es bloqueado por`.
- Actualiza el estado antes del check diario — Jira es la fuente de verdad.
- Cierra bugs solo cuando estén verificados en el ambiente correspondiente.

**Ceremonia de sprint:**
- Duración del sprint: 2 semanas (por defecto).
- Planning: lunes de la semana 1 del sprint.
- Review/Demo: último viernes.
- Retrospectiva: el mismo día de la demo.

**Prioridades:**
| Prioridad | Significado |
|-----------|-------------|
| Highest | Bloquea lanzamiento / caída de producción |
| High | Bloquea la meta del sprint |
| Medium | Importante, no bloquea |
| Low | Nice to have |

### Slack — Comunicación

**Canales:**
| Canal | Propósito |
|-------|-----------|
| `#general` | Anuncios de la empresa |
| `#ventas-sales` | Leads, propuestas, cotizaciones |
| `#proyecto-[nombre]` / `#cliente-[nombre]` | Trabajo por proyecto (con cliente si se acuerda) |
| `#engineering` | Discusión técnica, RFCs |
| `#design` | Discusiones de UI/UX |
| `#qa` | Coordinación de pruebas |
| `#random` | Café |

**Lineamientos:**
- Usa threads para todo tema que genere >2 respuestas.
- Usa `@channel` con moderación; prefiere menciones puntuales.
- Pon tu estado cuando estés ausente/en foco.
- En proyectos de cliente: mantén el canal ordenado — decisiones resumidas y enlazadas a Jira.
- No envíes secretos/contraseñas en Slack (usa el password manager).
- Un video vale más que texto largo al explicar un bug de UI (Loom).

### Conexión Jira ↔ Slack
- Issues nuevos asignados a ti → notificación en `#engineering`.
- Pull requests vinculadas a tickets de Jira → link automático en el thread.
- Recordatorios de demo en el canal del proyecto.
