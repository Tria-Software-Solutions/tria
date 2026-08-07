# 15 · Prácticas de Ingeniería / Engineering Practices

<table style="width:100%; border:none;">
<tr><td style="border:none;"><strong style="font-size:26px; letter-spacing:-0.02em;">tria<span style="color:#068e8c;">.</span></strong><br/><em>Tria Software Solutions</em></td>
<td style="border:none; text-align:right; font-size:12px; color:#444;">engineering@triacr.com · triacr.com</td></tr>
</table>

> **Quality-first is non-negotiable.** Automated testing, code reviews, and CI/CD pipelines are part of how we ship with confidence.

---

## Inglés / English

### 1. Definition of Done (DoD)
A story is **Done** only when:
- [ ] Code implemented per acceptance criteria
- [ ] Tests written and passing (unit + integration where applicable)
- [ ] Code reviewed and approved (at least 1 reviewer)
- [ ] CI pipeline green
- [ ] Deployed to staging and smoke-tested
- [ ] Documentation/runbook updated if needed
- [ ] No known critical/high severity issues

### 2. Branching & Commits
- Work on short-lived branches: `feature/[TRIA-123]-slug`, `fix/[TRIA-456]-slug`, `chore/...`.
- Commit messages: conventional commits — `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Reference the ticket: `feat(auth): add password reset [TRIA-123]`.
- Squash-merge into `develop`; `main` is stable and deployable.

### 3. Code Reviews
- Every PR needs at least **1 approval** (2 for critical paths: payments, auth, infra).
- Reviewer checklist:
  - Correctness against acceptance criteria
  - Tests cover the change
  - Security: no secrets, no injection, proper authz
  - Performance: no N+1, no obvious O(n²)
  - Naming and structure are clear
- Be kind and specific; the goal is the best shared codebase.

### 4. Testing Strategy
| Layer | Tools (examples) | Coverage |
|-------|-----------------|----------|
| Unit | Vitest / Jest / pytest / JUnit | Critical logic, utils, reducers |
| Integration | Supertest / Testcontainers | API endpoints, DB flows |
| E2E | Playwright / Cypress | Critical user journeys |
| Performance | k6 / Lighthouse CI | Load & page speed gates |

- Target: **≥80% coverage** on new critical code; no drop in existing coverage.
- QA policy details in [QA Policy](17-politica-qa.md).

### 5. CI/CD
- Every push → CI: lint, typecheck, unit tests, build.
- PR → CI: full test suite + preview environment (when feasible).
- Merge to `main` → CD: deploy to production (zero-downtime), with rollback ready.
- Infrastructure as Code (Terraform) for cloud resources; no manual console changes.

### 6. Observability
- Structured logging everywhere.
- Metrics + alerts for: error rate, latency, saturation (RED method).
- Traces for distributed systems.
- Dashboards per service; on-call runbook linked to alerts.

### 7. Security in Engineering
- Follow OWASP Top 10; validate and sanitize all inputs.
- Auth: use mature libraries; hash passwords (bcrypt/argon2); MFA where applicable.
- Secrets never in code — use the vault / CI secrets.
- Dependency scanning in CI (npm audit / pip-audit / dependabot).
- See [Security Policy](16-politica-seguridad.md).

---

## Español / Spanish

### 1. Definición de Hecho (DoD)
Una historia está **Hecha** solo cuando:
- [ ] Código implementado según criterios de aceptación
- [ ] Pruebas escritas y pasando (unit + integración donde aplique)
- [ ] Código revisado y aprobado (al menos 1 revisor)
- [ ] Pipeline CI verde
- [ ] Desplegado a staging y smoke-tested
- [ ] Documentación/runbook actualizado si es necesario
- [ ] Sin issues conocidos de severidad crítica/alta

### 2. Ramas y Commits
- Trabaja en ramas de vida corta: `feature/[TRIA-123]-slug`, `fix/[TRIA-456]-slug`, `chore/...`.
- Mensajes de commit: conventional commits — `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Referencia el ticket: `feat(auth): add password reset [TRIA-123]`.
- Squash-merge hacia `develop`; `main` es estable y desplegable.

### 3. Code Reviews
- Todo PR necesita al menos **1 aprobación** (2 para rutas críticas: pagos, auth, infra).
- Checklist del revisor:
  - Correctitud contra los criterios de aceptación
  - Las pruebas cubren el cambio
  - Seguridad: sin secretos, sin inyección, authz correcta
  - Performance: sin N+1, sin O(n²) evidente
  - Naming y estructura claros
- Sé amable y específico; el objetivo es el mejor codebase compartido.

### 4. Estrategia de Pruebas
| Capa | Herramientas (ejemplos) | Cobertura |
|------|-------------------------|-----------|
| Unit | Vitest / Jest / pytest / JUnit | Lógica crítica, utils, reducers |
| Integración | Supertest / Testcontainers | Endpoints API, flujos de BD |
| E2E | Playwright / Cypress | Journeys críticos de usuario |
| Performance | k6 / Lighthouse CI | Gates de carga y page speed |

- Objetivo: **≥80% de cobertura** en código crítico nuevo; sin caídas en cobertura existente.
- Detalles de política de QA en [Política de QA](17-politica-qa.md).

### 5. CI/CD
- Cada push → CI: lint, typecheck, tests unit, build.
- PR → CI: suite completa + ambiente de preview (cuando sea viable).
- Merge a `main` → CD: deploy a producción (zero-downtime), con rollback listo.
- Infraestructura como Código (Terraform) para recursos cloud; sin cambios manuales en consola.

### 6. Observabilidad
- Logging estructurado en todos lados.
- Métricas + alertas para: tasa de error, latencia, saturación (método RED).
- Traces para sistemas distribuidos.
- Dashboards por servicio; runbook de on-call vinculado a las alertas.

### 7. Seguridad en Ingeniería
- Sigue OWASP Top 10; valida y sanitiza todas las entradas.
- Auth: usa librerías maduras; hashea contraseñas (bcrypt/argon2); MFA donde aplique.
- Secretos nunca en código — usa el vault / secretos de CI.
- Escaneo de dependencias en CI (npm audit / pip-audit / dependabot).
- Ver [Política de Seguridad](16-politica-seguridad.md).
