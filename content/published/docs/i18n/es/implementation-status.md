---
title: Estado de implementación de OpenOrgOS
description: Protocolo global, Wire, sitio Community, Commercial Hub y gateways nacionales como X-Road — qué está activo hoy
---

> **Audiencia:** Stewards, miembros de comités, integradores y socios que evalúan OpenOrgOS.  
> **Actualizado:** 2026-07 — Community en Phase 0; Hub y adaptadores de gateway nacional por jurisdicción.  
> **Fuente canónica del protocolo:** repositorio OrgOS — si esta página y el repo difieren, **prevalece el repo**.

## De un vistazo

OpenOrgOS abarca **tres capas separables**. No confunda el progreso en una capa con el de otra.

| Capa | Qué es | Estado |
|------|--------|--------|
| **Protocolo global** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Definido** — vocabulario y arquitectura en repo OrgOS |
| **Wire · Witness** | Transporte interorganizacional y evidencia verificable | **Especificado** — implementación de referencia en OrgOS; no es producto Community |
| **Runtime OrgOS** | Stack steward on-premises (Core, Modules, Agents, CLI) | **Disponible** — instalable; módulos varían por dominio |
| **OpenOrgOS Community** (este sitio) | Registro OSS, comités, gobernanza, aprendizaje | **Activo** — Phase 0 |
| **Commercial Hub** | Marketplace de módulos de pago por jurisdicción | **Phase 0→1** — aún sin ventas |
| **Gateways nacionales** (clase X-Road) | Adaptadores a redes seguras país/región | **Planificado** — sin adaptador entregado; módulos de jurisdicción definen mapeo |

**Está aquí:** Community y registro WILD operativos. Ventas Hub y adaptadores clase X-Road son **trabajo de diseño y cohort**, no integraciones live en este sitio.

---

## Capa de protocolo global

La **capa global permanece fina**. Define *cómo* las organizaciones intercambian estado entre fronteras — no reglas de negocio locales.

| Capacidad | Definición | Runtime |
|-----------|------------|---------|
| **Org Event Model** | Documentado en misión y vocabulario OrgOS | Eventos registrados dentro de OrgOS; **relay inter-org es P2** (ver Wire) |
| **Identity Exchange** | Definido | Identidad local al tenant hoy; intercambio federado **planificado con Wire** |
| **Authority Delegation** | Definido en módulos y límites de agent | Operativo dentro del tenant; delegación inter-org **vía Wire** |
| **Auditability** | Definido (Witness, timelines) | Operativo dentro del tenant |

Terminología (Module vs Agent vs Wire): [Module and Agent](/content/module-and-agent).

---

## Wire y Witness

**Wire** **no** es Module, Agent ni producto Hub. Es el **transporte de protocolo** para mensajes y eventos org-to-org. **Witness** cubre evidencia verificable por terceros.

### Dónde sitúa Wire en OrgOS

| # | Componente | Función |
|---|------------|---------|
| 1 | **OpenOrgOS Core** | Motor de reglas, config tenant, CLI |
| 2 | **Module linkage** | Packs de dominio (contabilidad, dispositivos médicos, …) |
| 3 | **Wire · Witness** | Intercambio transfronterizo y evidencia de auditoría |
| — | **Agents** | Operadores LLM acotados *dentro* del tenant |

Corrección común: **«Agent envía Wire»** es incorrecto. Wire es nivel protocolo; agents **redactan**; humanos **aprueban**; **CLI / Skill** ejecuta determinísticamente.

### Estado de implementación

| Item | Estado |
|------|--------|
| Vocabulario y arquitectura (`orgos-vocabulary.md`, etc.) | **Publicado** en repo OrgOS |
| Operaciones en tenant (Skills, CLI, agents, modules) | **Utilizable** en OrgOS instalado |
| **Org Event relay** (gateway inter-org) | **P2 planificado** — backlog Control Plane; no live en Community |
| Endpoint Wire público en `community.oorgos.org` | **No ofrecido** — Community es registro/gobernanza, no hub Wire |

Cuando exista el relay, **no** reemplazará gateways jurisdiccionales; transporta **eventos OpenOrgOS** entre orgs participantes.

---

## Commercial Hub

El **Hub** es el **canal Commercial** — operadores licenciados venden y dan soporte a módulos **por dominio legal**. Separado de la revisión Community.

| Item | Estado |
|------|--------|
| Registro WILD + Community en este sitio | **Activo** — [/modules](/modules) |
| Comités y gobernanza | **Activo** — [/committees](/committees), [/governance](/governance) |
| Pipeline Candidate + Program Fund | **Prep Phase 1** — cohort y Assess definidos, no totalmente automatizados |
| Marketplace Commercial Hub | **No activo** — primer cohort jurisdiccional en curso |
| Productos Agent en Hub | **Fuera de alcance por ahora** — módulos primero |

Fases (detalle): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ listo para Commercial.** Listado Commercial requiere **ruta Hub**, no solo promoción en registro.

---

## X-Road y gateways de intercambio nacional

### Qué es X-Road

**[X-Road](https://x-road.global/)** es una **capa nacional (o regional) de intercambio seguro de datos** — organizaciones miembro se conectan vía security servers; acceso gobernado por política y contrato (Estonia, Finlandia, otros miembros NIIS).

X-Road responde: *«¿Cómo conecta mi organización al tejido de intercambio confiable del **país**?»*

### Relación con OpenOrgOS

| | **OpenOrgOS Wire** | **Gateway clase X-Road** |
|---|-------------------|---------------------------|
| Alcance | Intercambio **org-to-org** en forma OpenOrgOS | Membresía a **infraestructura nacional** y gateway técnico |
| Propietario | Orgs participantes + spec protocolo | Operador país/región (ej. miembros NIIS) |
| Contenido | Eventos org, delegación, sobres auditoría | Mensajes específicos y esquemas nacionales |
| Rol OpenOrgOS | **Modelo semántico** y runtime steward | **No reemplaza** X-Road — **interop** donde comités lo exijan |

OpenOrgOS **no entrega hoy adaptador X-Road de producción**. Escenarios transfronterizos/sector público combinan:

1. **Runtime OrgOS** (fuente de verdad local),
2. **Wire** (eventos org-to-org OpenOrgOS, cuando relay disponible),
3. **Módulo jurisdicción + adaptador gateway** (mapeo mensajes gateway ↔ Org Event Model).

### Estado y próximos pasos

| Item | Estado |
|------|--------|
| Módulo adaptador X-Road en registro Community | **Ninguno listado aún** |
| Adaptador de referencia en repo OrgOS | **No entregado** |
| Charter comité sector público / gateway interop | **Invitado** — comités dominio y jurisdicción |
| Ruta RFC OOO para perfiles gateway | **Disponible** — standards vía OOO Program |

En entorno miembro X-Road, **proponga módulo de jurisdicción** o únase al [comité](/committees) relevante — mapeo gateway son **reglas locales**, no protocolo global.

---

## Sitio OpenOrgOS Community (este sitio)

Qué implementa hoy `community.oorgos.org`:

| Capacidad | Estado |
|-----------|--------|
| Registro de módulos (WILD, lifecycle) | **Activo** |
| Propuestas wild module | **Activo** |
| Comités y gobernanza de dominio | **Activo** |
| Certificaciones y solicitudes de role | **Activo** |
| Identity (Google; GitHub / LinkedIn connect) | **Activo** |
| Guías y docs (`/content/*`) | **Activo** |
| Rutas Academy | **Parcial** — depende config Academy |
| Commercial Hub / pagos | **No en este sitio** |
| Wire / ingress Org Event | **No en este sitio** |

Infraestructura: visión general en [oorgos.org](https://oorgos.org); Community en deployment steward + Cloudflare Tunnel (runbooks en `docs/`).

---

## Runtime OrgOS (on-premises)

Para stewards que instalan OrgOS en hardware propio:

| Item | Estado |
|------|--------|
| Guía install y digital twin | **Publicada** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Disponibles** en stack de referencia |
| Módulos de dominio (rental, jp_medical_device, …) | **Varía** — [/modules](/modules) |
| Heartbeat Control Plane / outbound agent | **Arquitectura definida** — `docs/plans/` |
| Org Event relay a otras orgs | **P2 — no GA** |

---

## Resumen del roadmap

| Fase | Foco | Entregables representativos |
|------|------|----------------------------|
| **Ahora (Phase 0)** | OSS Community, registro, comités | Este sitio, WILD, gobernanza |
| **Phase 0→1** | Primer cohort Hub | Ruta Commercial manual en una jurisdicción |
| **Phase 1–2** | Candidate + Assess + Program Fund | Pipeline prep audit pagado |
| **Protocolo P2** | Org Event relay (gateway Wire) | Transporte eventos inter-org |
| **Por jurisdicción** | Adaptadores X-Road / gateway nacional | Mapeo módulo + comité |

---

## Enlaces relacionados

| Recurso | Enlace |
|---------|--------|
| Module ecosystem (fases Hub) | [/content/module-ecosystem](/content/module-ecosystem) |
| Terminología Module / Agent / Wire | [/content/module-and-agent](/content/module-and-agent) |
| Misión y protocolo global | [/content/mission](/content/mission) |
| Registro de módulos | [/modules](/modules) |
| Gobernanza | [/governance](/governance) |
| Guía install OrgOS | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Todos los docs | [/content](/content) |
