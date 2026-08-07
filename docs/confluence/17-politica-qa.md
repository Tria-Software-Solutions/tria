# 17 · Política de QA / QA Policy

<table style="width:100%; border:none;">
<tr><td style="border:none;"><strong style="font-size:26px; letter-spacing:-0.02em;">tria<span style="color:#068e8c;">.</span></strong><br/><em>Tria Software Solutions</em></td>
<td style="border:none; text-align:right; font-size:12px; color:#444;">qa@triacr.com · triacr.com</td></tr>
</table>

---

## Inglés / English

### Purpose
Guarantee quality across web, mobile, and APIs — automated and manual — so we ship with confidence.

### Test Pyramid
```
         / E2E (few, critical journeys) \
        /  Integration (API + DB)        \
       /   Unit (many, fast)              \
```

### Test Levels
| Level | What | Owner | Gate |
|-------|------|-------|------|
| Unit | Functions, components, reducers | Engineer | PR |
| Integration | API endpoints, DB, 3rd parties | Engineer | PR |
| E2E | Critical user journeys | QA + Engineer | Pre-release |
| Manual | Exploratory, usability, regression | QA | Sprint review |
| Performance | Load, page speed | QA | Pre-release (major) |

### QA Checklist Before Release
- [ ] Automated suite green (unit + integration + E2E critical)
- [ ] Manual regression on the changed areas
- [ ] Tested on: [Chrome, Safari, Firefox] desktop + [iOS, Android] mobile
- [ ] Accessibility check (WCAG basics): keyboard navigation, contrast
- [ ] Error states, empty states, and loading states covered
- [ ] Performance: Lighthouse ≥ [90] on critical pages
- [ ] Security: no known high/critical issues (see [Security](16-politica-seguridad.md))
- [ ] Data: no test data leaking to production

### Bug Lifecycle
1. **New** — reproduced, with steps + environment + severity.
2. **Triaged** — severity & priority assigned in sprint.
3. **In Progress** — assigned to engineer.
4. **In Review** — fix submitted.
5. **Verified** — QA re-tested in the fixed environment.
6. **Closed** — verified in the release candidate.

### Severity Levels
| Severity | Definition | Example |
|----------|-----------|---------|
| Blocker | Blocks release / data loss / security breach | Auth broken in production |
| High | Major feature unusable, no workaround | Checkout fails |
| Medium | Partial workaround exists | Wrong label in a rare flow |
| Low | Cosmetic / nice to have | Misaligned icon |

### Environments
- **Local** → **Develop** → **Staging** (mirrors production) → **Production**.
- Staging is mandatory for all releases; data should be anonymized.

---

## Español / Spanish

### Propósito
Garantizar la calidad en web, móvil y APIs — automatizada y manual — para entregar con confianza.

### Pirámide de Pruebas
```
         / E2E (pocas, journeys críticos) \
        /  Integración (API + BD)          \
       /   Unit (muchas, rápidas)           \
```

### Niveles de Prueba
| Nivel | Qué | Responsable | Gate |
|-------|-----|-------------|------|
| Unit | Funciones, componentes, reducers | Ingeniero | PR |
| Integración | Endpoints API, BD, terceros | Ingeniero | PR |
| E2E | Journeys críticos de usuario | QA + Ingeniero | Pre-release |
| Manual | Exploratoria, usabilidad, regresión | QA | Sprint review |
| Performance | Carga, page speed | QA | Pre-release (mayor) |

### Checklist de QA Antes del Release
- [ ] Suite automatizada verde (unit + integración + E2E crítico)
- [ ] Regresión manual en las áreas cambiadas
- [ ] Probado en: [Chrome, Safari, Firefox] desktop + [iOS, Android] móvil
- [ ] Check de accesibilidad (básico WCAG): navegación por teclado, contraste
- [ ] Estados de error, vacíos y de carga cubiertos
- [ ] Performance: Lighthouse ≥ [90] en páginas críticas
- [ ] Seguridad: sin issues conocidos altos/críticos (ver [Seguridad](16-politica-seguridad.md))
- [ ] Datos: sin data de prueba en producción

### Ciclo de Vida del Bug
1. **Nuevo** — reproducido, con pasos + ambiente + severidad.
2. **Triaged** — severidad y prioridad asignadas en el sprint.
3. **En Progreso** — asignado al ingeniero.
4. **En Revisión** — fix enviado.
5. **Verificado** — QA re-probó en el ambiente corregido.
6. **Cerrado** — verificado en el release candidate.

### Niveles de Severidad
| Severidad | Definición | Ejemplo |
|-----------|------------|---------|
| Blocker | Bloquea release / pérdida de datos / brecha de seguridad | Auth roto en producción |
| Alta | Feature mayor inutilizable, sin workaround | Checkout falla |
| Media | Existe workaround parcial | Etiqueta incorrecta en flujo raro |
| Baja | Cosmético / nice to have | Icono desalineado |

### Ambientes
- **Local** → **Develop** → **Staging** (espejo de producción) → **Producción**.
- Staging es obligatorio para todos los releases; los datos deben estar anonimizados.
