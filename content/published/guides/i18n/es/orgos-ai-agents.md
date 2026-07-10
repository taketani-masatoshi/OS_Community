---
title: OrgOS con agentes de IA (Cursor)
description: Usa Cursor y agentes de IA para entender y operar OrgOS en lenguaje natural.
---

> **Resumen:** [¿Qué es OrgOS?](/learning#about-orgos) en el hub de aprendizaje — software determinista operado mediante LLM y agentes de IA en lenguaje natural.

**Requisito previo:** [Instalación de OrgOS y gemelo digital](/content/orgos-install-setup) completada, o tenant local funcional.

## Qué hacen los agentes

| Capacidad | Ejemplo |
|-----------|---------|
| **Explicar** | «¿Qué permite el manifest del agente finance?» |
| **Navegar** | «¿Qué módulos están activos en este tenant?» |
| **Borrador** | «Genera una plantilla de propuesta de comité para jurisdicción JP» |
| **Validar** | «Ejecuta validate y resume los fallos» |
| **Operar** | «Muestra org events abiertos asignados a operations esta semana» |

Los agentes **no sustituyen la gobernanza**. Aprobaciones, delegaciones y reglas de auditoría siguen vigentes — trate al agente como **asistente Steward**, no ejecutivo autónomo.

## Cómo encaja

```text
Usted (lenguaje natural)
    ↓
Agente Cursor (lee repo + herramientas)
    ↓
Repositorio steward — agent.manifest.yaml, módulos, scripts
    ↓
Org Runtime / Org Console (local — los datos permanecen aquí)
    ↓
Opcional: OpenOrgOS Community (protocolo y registro públicos)
```

Las definiciones centrales están en `steward/agents/`. El [registro de agentes](/agents) de Community es catálogo público — el tenant puede extender localmente.

## Paso 1 — Abrir el workspace steward

1. Clone el repositorio Steward / OrgOS de la organización (mismo host que Org Console).
2. En Cursor: **File → Open Folder** → raíz del repositorio.
3. Confirme el árbol de agentes, p. ej. `steward/agents/executive/agent.manifest.yaml`.

Espere la indexación para que `@Codebase` funcione.

## Paso 2 — Reglas del proyecto (recomendado)

`.cursor/rules/orgos.mdc` o **Cursor Settings → Rules**:

- No pegue datos de negocio ni secretos `.env` en chats públicos
- Prefiera inspección de solo lectura antes de proponer escrituras
- Respete jurisdicción y límites de módulos de `tenant.yaml` / `.env`
- Ejecute `./scripts/validate.sh` tras cambios de config

## Paso 3 — Conectar contexto

| Fuente | Cómo adjuntar en Cursor |
|--------|-------------------------|
| Config del tenant | `@.env.example`, `@tenant.yaml` (redactado) |
| Organigrama | `@exports/org-chart.csv` |
| Lista de módulos | `@modules/enabled.json` o enlace del registro |
| Notas de onboarding | `@docs/onboarding-checklist.md` |
| Registro de agentes | `/agents` o `@steward/agents/` |

## Paso 4 — Patrones en lenguaje natural

### Exploración (solo lectura)

- «Resume qué puede hacer el agente compliance vs finance.»
- «Explica cómo se registra un org event del módulo X al log de auditoría.»

### Configuración (borrador → revisión)

- «Borrador de lista de módulos para empresa de servicios de 20 personas en JP — formato tabla.»
- «Explica la salida de validate.sh línea a línea» (tras ejecutar en terminal)

### Operaciones (cuidado — solo local)

- «Lista scripts que tocan datos de producción; clasifica lectura vs escritura.»

Evite comandos destructivos sin aprobación humana explícita.

## Paso 5 — Registro de agentes

El [registro de agentes](/agents) mapea dominios:

| Agente | Dominio | Preguntas típicas |
|--------|---------|-------------------|
| executive | governance | Estrategia, aprobaciones, comités |
| secretary | governance | Agenda, actas, correspondencia |
| finance | finance | Facturas, políticas contables |
| contract | finance | Ciclo de contratos |
| compliance | finance | Verificaciones regulatorias |
| operations | operations | Colas operativas |

Sincronice manifests locales tras actualizaciones del registro (`npm run sync:agents` en repo steward).

## Paso 6 — MCP y terminal (opcional)

- Prefiera herramientas MCP de **solo lectura** primero
- Use terminal para `docker compose ps`, `validate.sh` y logs — pegue la salida en el chat
- No exponga puertos admin de Org Console a internet pública

## Checklist de seguridad

- [ ] Agente opera contra clone **local** steward
- [ ] Secretos en `.env` — agente ve solo placeholders
- [ ] Escrituras revisadas por Steward Operator
- [ ] Validate pasa tras ediciones sugeridas por el agente

## Próximos pasos

| Recurso | Enlace |
|---------|--------|
| Instalación y gemelo digital | [Guía de instalación](/content/orgos-install-setup) |
| Visión general OrgOS | [Hub de aprendizaje](/learning#about-orgos) |
| Currículo | [Aprendizaje → Currículo](/learning#curriculum) |
| Registro de módulos | [Módulos](/modules#registry) |
