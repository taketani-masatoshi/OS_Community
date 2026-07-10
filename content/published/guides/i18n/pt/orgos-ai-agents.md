---
title: OrgOS com agentes de IA (Cursor)
description: Use Cursor e agentes de IA para entender e operar o OrgOS em linguagem natural.
---

> **Visão geral:** [O que é OrgOS?](/learning#about-orgos) no hub de aprendizado — software determinístico operado via LLMs e agentes de IA em linguagem natural.

**Pré-requisito:** [Instalação do OrgOS e gêmeo digital](/content/orgos-install-setup) concluída, ou tenant local funcional.

## O que os agentes fazem

| Capacidade | Exemplo |
|------------|---------|
| **Explicar** | «O que o manifest do agente finance permite?» |
| **Navegar** | «Quais módulos estão ativos neste tenant?» |
| **Rascunhar** | «Gere um modelo de proposta de comitê para jurisdição JP» |
| **Validar** | «Execute validate e resuma as falhas» |
| **Operar** | «Liste org events abertos atribuídos a operations esta semana» |

Os agentes **não substituem a governança**. Aprovações, delegações e regras de auditoria continuam — trate o agente como **assistente Steward**, não executivo autônomo.

## Como se encaixa

```text
Você (linguagem natural)
    ↓
Agente Cursor (lê repo + ferramentas)
    ↓
Repositório steward — agent.manifest.yaml, módulos, scripts
    ↓
Org Runtime / Org Console (local — dados ficam aqui)
    ↓
Opcional: OpenOrgOS Community (protocolo e registro públicos)
```

Definições centrais ficam em `steward/agents/`. O [registro de agentes](/agents) da Community é catálogo público — o tenant pode estender localmente.

## Passo 1 — Abrir o workspace steward

1. Clone o repositório Steward / OrgOS da organização (mesmo host do Org Console).
2. No Cursor: **File → Open Folder** → raiz do repositório.
3. Confirme a árvore de agentes, ex.: `steward/agents/executive/agent.manifest.yaml`.

Aguarde a indexação para `@Codebase` funcionar.

## Passo 2 — Regras do projeto (recomendado)

`.cursor/rules/orgos.mdc` ou **Cursor Settings → Rules**:

- Não cole dados de negócio ou segredos `.env` em chats públicos
- Prefira inspeção somente leitura antes de propor gravações
- Respeite jurisdição e limites de módulos de `tenant.yaml` / `.env`
- Execute `./scripts/validate.sh` após alterações de config

## Passo 3 — Conectar contexto

| Fonte | Como anexar no Cursor |
|-------|----------------------|
| Config do tenant | `@.env.example`, `@tenant.yaml` (redigido) |
| Organograma | `@exports/org-chart.csv` |
| Lista de módulos | `@modules/enabled.json` ou link do registro |
| Notas de onboarding | `@docs/onboarding-checklist.md` |
| Registro de agentes | `/agents` ou `@steward/agents/` |

## Passo 4 — Padrões em linguagem natural

### Exploração (somente leitura)

- «Resuma o que o agente compliance pode fazer vs finance.»
- «Explique como um org event é registrado do módulo X ao log de auditoria.»

### Configuração (rascunho → revisão)

- «Rascunhe lista de módulos para empresa de serviços de 20 pessoas em JP — formato tabela.»
- «Explique a saída do validate.sh linha a linha» (após executar no terminal)

### Operações (cuidado — apenas local)

- «Liste scripts que tocam dados de produção; classifique leitura vs escrita.»

Evite comandos destrutivos sem aprovação humana explícita.

## Passo 5 — Registro de agentes

O [registro de agentes](/agents) mapeia domínios:

| Agente | Domínio | Perguntas típicas |
|--------|---------|-------------------|
| executive | governance | Estratégia, aprovações, comitês |
| secretary | governance | Agenda, atas, correspondência |
| finance | finance | Faturas, políticas contábeis |
| contract | finance | Ciclo de contratos |
| compliance | finance | Verificações regulatórias |
| operations | operations | Filas operacionais |

Sincronize manifests locais após atualizações do registro (`npm run sync:agents` no repo steward).

## Passo 6 — MCP e terminal (opcional)

- Prefira ferramentas MCP **somente leitura** primeiro
- Use terminal para `docker compose ps`, `validate.sh` e logs — cole a saída no chat
- Não exponha portas admin do Org Console à internet pública

## Checklist de segurança

- [ ] Agente roda contra clone **local** steward
- [ ] Segredos em `.env` — agente vê apenas placeholders
- [ ] Operações de escrita revisadas pelo Steward Operator
- [ ] Validate passa após edições sugeridas pelo agente

## Próximos passos

| Recurso | Link |
|---------|------|
| Instalação e gêmeo digital | [Guia de instalação](/content/orgos-install-setup) |
| Visão geral OrgOS | [Hub de aprendizado](/learning#about-orgos) |
| Currículo | [Aprendizado → Currículo](/learning#curriculum) |
| Registro de módulos | [Módulos](/modules#registry) |
