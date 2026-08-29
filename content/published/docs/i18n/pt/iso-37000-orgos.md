---
title: OrgOS e ISO 37000
description: Como a inicialização do OrgOS sustenta uma autodeclaração de governança alinhada à ISO 37000.
---

# OrgOS e ISO 37000

**OrgOS** une implantação e governança: na **inicialização**, propósito, papéis, supervisão e rastreabilidade formam uma linha de base.

Essa base sustenta uma **autodeclaração** credível de alinhamento com a **ISO 37000** (*Governance of organizations* — orientação). A OpenOrgOS Community não emite certificados ISO de terceiros.

## O que a comunidade oferece

A OpenOrgOS Community é um **lar neutro** para protocolo, módulos, aprendizagem e operadores. As afirmações de governança permanecem com cada organização.

| Termo | Definição |
|--------|-----------|
| **OrgOS** | Runtime organizacional em infraestrutura que você controla |
| **OOO** | [OpenOrgOS Operator](/certifications) — papel de referência para implantação |
| **ISO 37000** | Orientação internacional sobre governança de organizações |
| **Autodeclaração** | Declaração própria — distinta de certificação acreditada |

A ISO 37000 é **orientação**, não um padrão certificável como a ISO 9001. O OrgOS torna a avaliação **operacional e baseada em evidências**.

## Sequência

1. **Implantar** — OrgOS em hardware próprio ([guia de instalação](/content/orgos-install-setup))
2. **Preparar** — identidade legal, estrutura, jurisdições, módulos
3. **Inicializar** — `orgos tenant init` escreve um esqueleto de propósito e um rascunho ISO 37000
4. **Avaliar** — `orgos governance principles status`. Mission placeholder não conta como ready
5. **Declarar** — apenas um humano: `orgos governance principles declare --signatory "…"`

Um **OpenOrgOS Operator (OOO)** normalmente lidera o caminho.

## Temas (ilustrativos)

| Princípio ISO 37000 | O que o OrgOS ajuda a estabelecer |
|---------------------|----------------------------------|
| **Purpose** | Missão, visão e valores no plano de negócios |
| **Value and strategy** | Planos, KPI e limites orçamentários |
| **Oversight** | Eventos da empresa, atas, Operator Console |
| **Accountability** | Operadores nomeados, RBAC, sem autoaprovação |
| **Stakeholders** | Consultores, registro de governança, IR / Wire |
| **Leadership** | Aprovação humana final, domínio de login, PassKey |
| **Data and decisions** | YAML como fonte da verdade, analytics, dashboards |
| **Risk** | Registro de riscos; ISMS se ISO 27001 estiver ativo |
| **Social responsibility** | ESG / normas ambientais quando aplicável |
| **Viability** | Planos plurianuais, dívida, ciclo de vida do tenant |

## Âmbito da «prontidão para autodeclarar»

**No âmbito:** estrutura operacional e rasto de decisões; percurso propósito → estrutura → supervisão; `orgos governance principles status`.

**Fora:** certificação ISO automática; aconselhamento jurídico; ISO 37001 (anticorrupção) ou ISO 37301 (CMS) — packs distintos.

## Próximos passos

| Ação | Recurso |
|-------|---------|
| Entender o OrgOS | [Learning](/learning#about-orgos) |
| Implantar | [OrgOS Install](/content/orgos-install-setup) |
| Operador | [Certifications](/certifications) |
| Governança comunitária | [Governance](/governance) |
