---
title: Estado de implementação do OpenOrgOS
description: Protocolo global, Wire, site Community, Commercial Hub e gateways nacionais como X-Road — o que está ativo hoje
---

> **Público:** Stewards, membros de comités, integradores e parceiros que avaliam o OpenOrgOS.  
> **Atualizado:** 2026-07 — Community em Phase 0; Hub e adaptadores de gateway nacional por jurisdição.  
> **Fonte canónica do protocolo:** repositório OrgOS — se esta página e o repo divergirem, **o repo prevalece**.

## Em resumo

O OpenOrgOS abrange **três camadas separáveis**. Não interprete o progresso numa camada como progresso noutra.

| Camada | O que é | Estado |
|--------|---------|--------|
| **Protocolo global** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Definido** — vocabulário e arquitetura no repo OrgOS |
| **Wire · Witness** | Transporte interorganizacional e evidência verificável | **Especificado** — implementação de referência no OrgOS; não é produto Community |
| **Runtime OrgOS** | Stack steward on-premises (Core, Modules, Agents, CLI) | **Disponível** — instalável; módulos variam por domínio |
| **OpenOrgOS Community** (este site) | Registo OSS, comités, governação, aprendizagem | **Ativo** — Phase 0 |
| **Commercial Hub** | Marketplace de módulos pagos por jurisdição | **Phase 0→1** — ainda sem vendas |
| **Gateways nacionais** (classe X-Road) | Adaptadores a redes seguras país/região | **Planificado** — sem adaptador entregue; módulos de jurisdição definem mapeamento |

**Está aqui:** Community e registo WILD operacionais. Vendas Hub e adaptadores classe X-Road são **trabalho de desenho e cohort**, não integrações live neste site.

---

## Camada de protocolo global

A **camada global permanece fina**. Define *como* as organizações trocam estado entre fronteiras — não regras de negócio locais.

| Capacidade | Definição | Runtime |
|------------|-----------|---------|
| **Org Event Model** | Documentado na missão e vocabulário OrgOS | Eventos registados dentro do OrgOS; **relay inter-org é P2** (ver Wire) |
| **Identity Exchange** | Definido | Identidade local ao tenant hoje; troca federada **planificada com Wire** |
| **Authority Delegation** | Definido em módulos e limites de agent | Operacional dentro do tenant; delegação inter-org **via Wire** |
| **Auditability** | Definido (Witness, timelines) | Operacional dentro do tenant |

Terminologia (Module vs Agent vs Wire): [Module and Agent](/content/module-and-agent).

---

## Wire e Witness

**Wire** **não** é Module, Agent ou produto Hub. É o **transporte de protocolo** para mensagens e eventos org-to-org. **Witness** cobre evidência verificável por terceiros.

### Onde Wire se situa no OrgOS

| # | Componente | Função |
|---|------------|--------|
| 1 | **OpenOrgOS Core** | Motor de regras, config tenant, CLI |
| 2 | **Module linkage** | Packs de domínio (contabilidade, dispositivos médicos, …) |
| 3 | **Wire · Witness** | Troca transfronteiriça e evidência de auditoria |
| — | **Agents** | Operadores LLM limitados *dentro* do tenant |

Correção comum: **«Agent envia Wire»** está errado. Wire é nível protocolo; agents **elaboram**; humanos **aprovam**; **CLI / Skill** executa deterministicamente.

### Estado de implementação

| Item | Estado |
|------|--------|
| Vocabulário e arquitetura (`orgos-vocabulary.md`, etc.) | **Publicado** no repo OrgOS |
| Operações no tenant (Skills, CLI, agents, modules) | **Utilizável** em OrgOS instalado |
| **Org Event relay** (gateway inter-org) | **P2 planificado** — backlog Control Plane; não live na Community |
| Endpoint Wire público em `community.oorgos.org` | **Não oferecido** — Community é registo/governação, não hub Wire |

Quando o relay existir, **não** substituirá gateways jurisdicionais; transporta **eventos OpenOrgOS** entre orgs participantes.

---

## Commercial Hub

O **Hub** é o **canal Commercial** — operadores licenciados vendem e suportam módulos **por domínio legal**. Separado da revisão Community.

| Item | Estado |
|------|--------|
| Registo WILD + Community neste site | **Ativo** — [/modules](/modules) |
| Comités e governação | **Ativo** — [/committees](/committees), [/governance](/governance) |
| Pipeline Candidate + Program Fund | **Prep Phase 1** — cohort e Assess definidos, não totalmente automatizados |
| Marketplace Commercial Hub | **Não ativo** — primeiro cohort jurisdicional em curso |
| Produtos Agent no Hub | **Fora de âmbito por agora** — módulos primeiro |

Fases (detalhe): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ pronto para Commercial.** Listagem Commercial exige **caminho Hub**, não só promoção no registo.

---

## X-Road e gateways de troca nacional

### O que é X-Road

**[X-Road](https://x-road.global/)** é uma **camada nacional (ou regional) de troca segura de dados** — organizações membro ligam-se via security servers; acesso governado por política e contrato (Estónia, Finlândia, outros membros NIIS).

X-Road responde: *«Como liga a minha organização ao tecido de troca confiável do **país**?»*

### Relação com OpenOrgOS

| | **OpenOrgOS Wire** | **Gateway classe X-Road** |
|---|-------------------|---------------------------|
| Âmbito | Troca **org-to-org** em forma OpenOrgOS | Adesão a **infraestrutura nacional** e gateway técnico |
| Proprietário | Orgs participantes + spec protocolo | Operador país/região (ex. membros NIIS) |
| Conteúdo | Eventos org, delegação, envelopes auditoria | Mensagens específicas e schemas nacionais |
| Papel OpenOrgOS | **Modelo semântico** e runtime steward | **Não substitui** X-Road — **interop** onde comités exigem |

OpenOrgOS **não entrega hoje adaptador X-Road de produção**. Cenários transfronteiriços/setor público combinam:

1. **Runtime OrgOS** (fonte de verdade local),
2. **Wire** (eventos org-to-org OpenOrgOS, quando relay disponível),
3. **Módulo jurisdição + adaptador gateway** (mapeamento mensagens gateway ↔ Org Event Model).

### Estado e próximos passos

| Item | Estado |
|------|--------|
| Módulo adaptador X-Road no registo Community | **Nenhum listado ainda** |
| Adaptador de referência no repo OrgOS | **Não entregue** |
| Charter comité setor público / gateway interop | **Convidado** — comités domínio e jurisdição |
| Caminho RFC OOO para perfis gateway | **Disponível** — standards via OOO Program |

Em ambiente membro X-Road, **proponha módulo de jurisdição** ou junte-se ao [comité](/committees) relevante — mapeamento gateway são **regras locais**, não protocolo global.

---

## Site OpenOrgOS Community (este site)

O que `community.oorgos.org` implementa hoje:

| Capacidade | Estado |
|------------|--------|
| Registo de módulos (WILD, lifecycle) | **Ativo** |
| Propostas wild module | **Ativo** |
| Comités e governação de domínio | **Ativo** |
| Certificações e pedidos de role | **Ativo** |
| Identity (Google; GitHub / LinkedIn connect) | **Ativo** |
| Guias e docs (`/content/*`) | **Ativo** |
| Trilhas Academy | **Parcial** — depende config Academy |
| Commercial Hub / pagamentos | **Não neste site** |
| Wire / ingress Org Event | **Não neste site** |

Infraestrutura: visão geral em [oorgos.org](https://oorgos.org); Community em deployment steward + Cloudflare Tunnel (runbooks em `docs/`).

---

## Runtime OrgOS (on-premises)

Para stewards que instalam OrgOS no próprio hardware:

| Item | Estado |
|------|--------|
| Guia install e digital twin | **Publicado** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Disponíveis** na stack de referência |
| Módulos de domínio (rental, jp_medical_device, …) | **Varia** — [/modules](/modules) |
| Heartbeat Control Plane / outbound agent | **Arquitetura definida** — `docs/plans/` |
| Org Event relay para outras orgs | **P2 — não GA** |

---

## Resumo do roadmap

| Fase | Foco | Entregáveis representativos |
|------|------|----------------------------|
| **Agora (Phase 0)** | OSS Community, registo, comités | Este site, WILD, governação |
| **Phase 0→1** | Primeiro cohort Hub | Caminho Commercial manual numa jurisdição |
| **Phase 1–2** | Candidate + Assess + Program Fund | Pipeline prep audit pago |
| **Protocolo P2** | Org Event relay (gateway Wire) | Transporte eventos inter-org |
| **Por jurisdição** | Adaptadores X-Road / gateway nacional | Mapeamento módulo + comité |

---

## Links relacionados

| Recurso | Link |
|---------|------|
| Module ecosystem (fases Hub) | [/content/module-ecosystem](/content/module-ecosystem) |
| Terminologia Module / Agent / Wire | [/content/module-and-agent](/content/module-and-agent) |
| Missão e protocolo global | [/content/mission](/content/mission) |
| Registo de módulos | [/modules](/modules) |
| Governação | [/governance](/governance) |
| Guia install OrgOS | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Todos os docs | [/content](/content) |
