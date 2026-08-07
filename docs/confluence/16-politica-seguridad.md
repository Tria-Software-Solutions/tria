# 16 · Política de Seguridad / Security Policy

<table style="width:100%; border:none;">
<tr><td style="border:none;"><strong style="font-size:26px; letter-spacing:-0.02em;">tria<span style="color:#068e8c;">.</span></strong><br/><em>Tria Software Solutions</em></td>
<td style="border:none; text-align:right; font-size:12px; color:#444;">security@triacr.com · triacr.com</td></tr>
</table>

---

## Inglés / English

### Security Principles
1. **Zero-trust** — verify identity and authorization on every request, every layer.
2. **Least privilege** — minimal access, revoked when unused.
3. **Defense in depth** — multiple controls; no single point of failure.
4. **Secure by design** — security built in at architecture time, not bolted on.
5. **OWASP Top 10** — reference for application security requirements.

### Access & Identity
- MFA mandatory on all work accounts (email, cloud, GitHub, password manager, Jira).
- Password manager for all credentials; no shared passwords in Slack/chat.
- Least privilege on cloud IAM; review access quarterly.
- Onboarding/offboarding: access granted/revoked within [1] business day.

### Application Security
- Input validation & sanitization on all inputs (XSS, SQLi, injection).
- AuthN/AuthZ: mature libraries, hashed passwords (bcrypt/argon2), session security.
- Secrets management: never in code or repos — CI vault / environment secrets.
- Dependency scanning in CI (npm audit, pip-audit, dependabot).
- SAST/DAST for critical projects; pen test at least annually for client platforms (or per contract).

### Infrastructure Security
- Cloud: IaC (Terraform), no public buckets with sensitive data, security groups locked down.
- Encryption: TLS 1.2+ in transit; AES-256 at rest; encrypted disks on all devices.
- Backups: automated, tested restores quarterly, offsite copies.
- Kubernetes: RBAC, network policies, image scanning, no privileged containers.

### Data Protection & Compliance
- Client data processed only for the agreed purpose; data minimization.
- Anonymize test/staging data; no production data in lower environments.
- Support compliance efforts: HIPAA / SOC2 / GDPR (as contracted).
- Data classification: Public / Internal / Confidential / Restricted.

### Incident Handling
- Report any suspected incident immediately — see [Incident Response](18-respuesta-incidentes.md).
- Do not delete evidence; preserve logs.
- Communicate with the client per contract within the agreed window.

### Reporting Vulnerabilities
- Responsible disclosure: report privately to security@triacr.com (no public exploit posts).

---

## Español / Spanish

### Principios de Seguridad
1. **Zero-trust** — verifica identidad y autorización en cada request y cada capa.
2. **Privilegio mínimo** — acceso mínimo, revocado cuando no se usa.
3. **Defensa en profundidad** — múltiples controles; sin punto único de falla.
4. **Seguro por diseño** — seguridad en la arquitectura, no agregada después.
5. **OWASP Top 10** — referencia para requisitos de seguridad de aplicaciones.

### Acceso e Identidad
- MFA obligatorio en todas las cuentas de trabajo (email, cloud, GitHub, password manager, Jira).
- Password manager para todas las credenciales; sin contraseñas compartidas en Slack/chat.
- Privilegio mínimo en IAM cloud; revisión de accesos trimestral.
- Onboarding/offboarding: acceso otorgado/revocado en [1] día hábil.

### Seguridad de Aplicaciones
- Validación y sanitización de todas las entradas (XSS, SQLi, inyección).
- AuthN/AuthZ: librerías maduras, contraseñas hasheadas (bcrypt/argon2), seguridad de sesión.
- Gestión de secretos: nunca en código ni repos — vault de CI / secretos de ambiente.
- Escaneo de dependencias en CI (npm audit, pip-audit, dependabot).
- SAST/DAST para proyectos críticos; pen test al menos anual para plataformas de clientes (o según contrato).

### Seguridad de Infraestructura
- Cloud: IaC (Terraform), sin buckets públicos con datos sensibles, security groups cerrados.
- Cifrado: TLS 1.2+ en tránsito; AES-256 en reposo; discos cifrados en todos los dispositivos.
- Backups: automatizados, restauraciones probadas trimestralmente, copias fuera de sitio.
- Kubernetes: RBAC, network policies, escaneo de imágenes, sin contenedores privilegiados.

### Protección de Datos y Cumplimiento
- Datos de clientes procesados solo para el propósito acordado; minimización de datos.
- Anonimiza datos de prueba/staging; sin datos de producción en ambientes inferiores.
- Soporte a esfuerzos de cumplimiento: HIPAA / SOC2 / GDPR (según contrato).
- Clasificación de datos: Público / Interno / Confidencial / Restringido.

### Manejo de Incidentes
- Reporta cualquier incidente sospechoso de inmediato — ver [Respuesta a Incidentes](18-respuesta-incidentes.md).
- No borres evidencia; preserva logs.
- Comunica al cliente según contrato dentro de la ventana acordada.

### Reportar Vulnerabilidades
- Divulgación responsable: reporta de forma privada a security@triacr.com (sin publicar exploits).
