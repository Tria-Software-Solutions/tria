# 18 · Respuesta a Incidentes / Incident Response

<table style="width:100%; border:none;">
<tr><td style="border:none;"><strong style="font-size:26px; letter-spacing:-0.02em;">tria<span style="color:#068e8c;">.</span></strong><br/><em>Tria Software Solutions</em></td>
<td style="border:none; text-align:right; font-size:12px; color:#444;">support@triacr.com · security@triacr.com · triacr.com</td></tr>
</table>

---

## Inglés / English

### Severity Levels
| Sev | Definition | Response time | Example |
|-----|-----------|---------------|---------|
| **SEV-1** | Production down / data breach / security incident | 15 min · 24/7 | Site down, auth compromised |
| **SEV-2** | Major feature degraded, workaround exists | 1 hour · business hours | Checkout failing intermittently |
| **SEV-3** | Minor issue, no user impact | Next business day | Cosmetic bug |

### Response Team
| Role | Responsibility |
|------|----------------|
| Incident Commander (IC) | Coordinates response, owns communication |
| On-call Engineer | Investigates & fixes |
| QA | Verifies fix |
| Account/Client comms | Client updates (per contract SLA) |

### Runbook — SEV-1
1. **Detect & declare** — alert fires or user reports; declare incident in `#incidents`.
2. **Assemble** — IC + on-call engineer jump in immediately.
3. **Mitigate** — priority is restoring service: rollback, feature flag off, scale up.
4. **Communicate** — status page / client POC update within [15 min], then every [30 min].
5. **Investigate** — root cause: logs, traces, metrics, deploy history.
6. **Verify** — confirm service healthy and monitoring stable.
7. **Postmortem** within [48h] — timeline, root cause, action items (see template below).
8. **Close** — final client summary, action items tracked in Jira.

### Postmortem Template
| Field | Content |
|-------|---------|
| Incident ID | INC-2026-### |
| Severity | SEV-1 / 2 / 3 |
| Date / Duration | [DATE] · [DURATION] |
| Impact | [Users, revenue, data affected] |
| Timeline | [Detailed timeline of events] |
| Root cause | [Why it happened] |
| Trigger | [What set it off] |
| Detection | [How we found out + time to detect] |
| Mitigation | [How service was restored] |
| Action items | [Fix 1 (owner, due) · Fix 2 (owner, due)] |
| Prevention | [Process/tooling changes] |

---

## Español / Spanish

### Niveles de Severidad
| Sev | Definición | Tiempo de respuesta | Ejemplo |
|-----|-----------|---------------------|---------|
| **SEV-1** | Producción caída / brecha de datos / incidente de seguridad | 15 min · 24/7 | Sitio caído, auth comprometida |
| **SEV-2** | Feature mayor degradado, hay workaround | 1 hora · horario laboral | Checkout falla intermitentemente |
| **SEV-3** | Issue menor, sin impacto al usuario | Siguiente día hábil | Bug cosmético |

### Equipo de Respuesta
| Rol | Responsabilidad |
|-----|-----------------|
| Incident Commander (IC) | Coordina la respuesta, dueño de la comunicación |
| Ingeniero on-call | Investiga y corrige |
| QA | Verifica el fix |
| Comunicación con cliente | Actualizaciones al cliente (según SLA del contrato) |

### Runbook — SEV-1
1. **Detectar y declarar** — suena la alerta o reporta el usuario; declara el incidente en `#incidents`.
2. **Reunir** — IC + ingeniero on-call entran de inmediato.
3. **Mitigar** — la prioridad es restaurar el servicio: rollback, feature flag off, escalar.
4. **Comunicar** — status page / POC del cliente en [15 min], luego cada [30 min].
5. **Investigar** — causa raíz: logs, traces, métricas, historial de deploys.
6. **Verificar** — confirma servicio saludable y monitoreo estable.
7. **Postmortem** en [48h] — timeline, causa raíz, action items (ver plantilla abajo).
8. **Cerrar** — resumen final al cliente, action items trackeados en Jira.

### Plantilla de Postmortem
| Campo | Contenido |
|-------|-----------|
| ID del incidente | INC-2026-### |
| Severidad | SEV-1 / 2 / 3 |
| Fecha / Duración | [FECHA] · [DURACIÓN] |
| Impacto | [Usuarios, ingresos, datos afectados] |
| Timeline | [Línea de tiempo detallada] |
| Causa raíz | [Por qué ocurrió] |
| Disparador | [Qué lo provocó] |
| Detección | [Cómo nos enteramos + tiempo en detectar] |
| Mitigación | [Cómo se restauró el servicio] |
| Action items | [Fix 1 (dueño, fecha) · Fix 2 (dueño, fecha)] |
| Prevención | [Cambios de proceso/herramientas] |
