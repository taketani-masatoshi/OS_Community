---
title: OrgOS e ISO 37000
description: Cómo la inicialización de OrgOS sustenta una autodeclaración de gobernanza alineada con ISO 37000.
---

# OrgOS e ISO 37000

**OrgOS** une el despliegue y la gobernanza: al **inicializar**, propósito, roles, supervisión y trazabilidad quedan en una misma línea base.

Esa línea base sostiene una **autodeclaración** creíble de alineación con **ISO 37000** (*Governance of organizations* — guía). OpenOrgOS Community no emite certificados ISO de terceros.

## Qué ofrece la comunidad

OpenOrgOS Community es un **hogar neutral** para protocolo, módulos, aprendizaje y operadores. Las afirmaciones de gobernanza siguen siendo responsabilidad de cada organización.

| Término | Definición |
|---------|------------|
| **OrgOS** | Runtime organizacional en infraestructura que usted controla |
| **OOO** | [OpenOrgOS Operator](/certifications) — rol de referencia para el despliegue |
| **ISO 37000** | Guía internacional sobre gobernanza de organizaciones |
| **Autodeclaración** | Declaración propia — distinta de la certificación acreditada |

ISO 37000 es **guía**, no un estándar certificable como ISO 9001. OrgOS hace la evaluación **operativa y basada en evidencia**.

## Secuencia

1. **Desplegar** — OrgOS en hardware propio ([guía de instalación](/content/orgos-install-setup))
2. **Preparar** — identidad legal, estructura, jurisdicciones, módulos
3. **Inicializar** — `orgos tenant init` escribe un esqueleto de propósito y un borrador ISO 37000
4. **Evaluar** — `orgos governance principles status`. Un mission de marcador no cuenta como ready
5. **Declarar** — solo un humano: `orgos governance principles declare --signatory "…"`

Un **OpenOrgOS Operator (OOO)** suele liderar el camino.

## Temas (ilustrativos)

| Principio ISO 37000 | Qué ayuda a establecer OrgOS |
|---------------------|-------------------------------|
| **Purpose** | Misión, visión y valores en el plan de negocio |
| **Value and strategy** | Planes, KPI y umbrales presupuestarios |
| **Oversight** | Eventos de la empresa, actas, Operator Console |
| **Accountability** | Operadores nominados, RBAC, sin autoaprobación |
| **Stakeholders** | Asesores, registro de gobernanza, IR / Wire |
| **Leadership** | Aprobación humana final, dominio de acceso, PassKey |
| **Data and decisions** | YAML como fuente de verdad, analytics, dashboards |
| **Risk** | Registro de riesgos; ISMS si ISO 27001 está activo |
| **Social responsibility** | ESG / normas ambientales cuando apliquen |
| **Viability** | Planes plurianuales, deuda, ciclo de vida del tenant |

## Alcance de la «preparación para autodeclarar»

**Dentro:** estructura operativa y rastro de decisiones; recorrido propósito → estructura → supervisión; `orgos governance principles status`.

**Fuera:** certificación ISO automática; asesoramiento jurídico; ISO 37001 (antisoborno) o ISO 37301 (CMS) — packs distintos.

## Siguientes pasos

| Acción | Recurso |
|--------|----------|
| Entender OrgOS | [Learning](/learning#about-orgos) |
| Desplegar | [OrgOS Install](/content/orgos-install-setup) |
| Operador | [Certifications](/certifications) |
| Gobernanza comunitaria | [Governance](/governance) |
