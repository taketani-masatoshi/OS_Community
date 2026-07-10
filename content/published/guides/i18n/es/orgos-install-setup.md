---
title: Instalación de OrgOS y preparación del gemelo digital
description: Instala OrgOS desde cero, organiza la información de la organización y prepara el entorno del gemelo digital.
---

> **Resumen:** [¿Qué es OrgOS?](/learning#about-orgos) en el hub de aprendizaje — software determinista, operación con IA en lenguaje natural y extensión por módulos.

Esta guía orienta al **Steward Operator** en el primer despliegue: requisitos previos, información antes de `tenant init` y la base del **gemelo digital** (organigrama, módulos, auditoría).

Los **datos de negocio de OrgOS permanecen en su infraestructura**. OpenOrgOS Community (`openorgos.net`) proporciona protocolo, registro de módulos y recursos de aprendizaje — no aloja datos del tenant.

## Público objetivo

| Rol | Objetivo |
|-----|----------|
| **Steward Operator** | Ejecutar Org Console en hardware de la empresa con poco soporte de TI |
| **Fundador / patrocinador** | Entender qué preparar antes del go-live |
| **Steward (consultor)** | Validar el entorno del cliente antes de la entrega |

## Resultados

1. Máquina compatible lista para OrgOS con Docker
2. Checklist de datos organizacionales (estructura, jurisdicciones, módulos)
3. Tenant inicializado con configuración validada
4. Alcance mínimo del gemelo digital: organigrama, módulos activos y auditoría

## Fase 0 — Información a reunir primero

Antes de `tenant init`, organice:

### Identidad organizacional

- Nombre legal, nombres comerciales y jurisdicción(es) principal(es)
- Año fiscal y moneda de informe
- Contacto diario del **Steward Operator**

### Estructura (semilla del gemelo digital)

- Departamentos / equipos y líneas de reporte
- Roles clave — mapéelos a [agentes Steward](/agents) cuando ayude
- Partes externas con las que intercambia org events

### Intención de módulos

Consulte el [registro de módulos](/modules#registry):

| Área | Ejemplos | ¿Lanzamiento? |
|------|----------|---------------|
| Gobernanza | propuestas, comités | A menudo sí |
| Finanzas | facturación, contratos | Según necesidad |
| Operaciones | inventario, planificación | Según necesidad |

### Límites de datos

- Lo que **nunca** debe salir del Mac mini (PII, contratos, detalle contable)
- Lo que puede resumirse en dashboards SaaS opcionales (solo lectura)

## Fase 1 — Hardware y red

| Componente | Propósito |
|------------|-----------|
| **Mac mini** (u host siempre encendido) | Org Runtime + Org Console — **fuente de verdad** |
| **Synology NAS** (opcional) | Copias de seguridad, artefactos |
| LAN estable | Acceso interno a Org Console |
| HTTPS saliente | GitHub, registro de módulos, heartbeat opcional |

## Fase 2 — Requisitos de software

```bash
docker --version
docker compose version
git --version
```

- Cuenta **GitHub** con acceso al repositorio OrgOS / Steward
- Cuenta OpenOrgOS Community en [openorgos.net](/login)
- Archivos `.env` solo en el host — nunca commitear credenciales

## Fase 3 — Clone y configuración

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Edite: TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

Corrija fallos de health check antes de continuar.

## Fase 4 — `tenant init` y validación

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Siga el README del repositorio steward. Resuelva todos los errores antes del go-live.

## Fase 5 — Baseline del gemelo digital

| Capa | Qué configurar |
|------|----------------|
| **Identity** | Personas, roles, cuentas vinculadas |
| **Authority** | Delegaciones, alcances de comité |
| **Events** | Org events generados por módulos |
| **Agents** | [Registro de agentes](/agents) |

- [ ] Roles ejecutivo y financiero asignados a personas reales
- [ ] Al menos un org event de prueba visible en Console
- [ ] Módulos activos documentados en el runbook
- [ ] Copia de seguridad probada (DB + config)

## Fase 6 — Próximos pasos

| Siguiente | Enlace |
|-----------|--------|
| Operar con IA (Cursor) | [OrgOS con agentes de IA](/content/orgos-ai-agents) |
| Visión general OrgOS | [Hub de aprendizaje](/learning#about-orgos) |
| Currículo | [Aprendizaje → Currículo](/learning#curriculum) |

## Solución de problemas

| Síntoma | Causa probable |
|---------|----------------|
| Fallo OAuth | URL del navegador ≠ `AUTH_URL` en `.env` |
| Error de conexión DB | Host `DATABASE_URL` incorrecto en red Docker |
| Módulo no carga | Fuera del registro o desactivado en tenant init |

## Lectura relacionada

- [Misión OpenOrgOS](/content/mission)
- [Modelo Stewardship](/content/stewardship-model)
- [Registro de agentes](/agents)
