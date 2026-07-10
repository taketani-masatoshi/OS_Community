---
title: Instalação do OrgOS e preparação do gêmeo digital
description: Instale o OrgOS do zero, organize as informações da organização e prepare o ambiente do gêmeo digital.
---

> **Visão geral:** [O que é OrgOS?](/learning#about-orgos) no hub de aprendizado — software determinístico, operação por IA em linguagem natural e extensão por módulos.

Este guia orienta o **Steward Operator** no primeiro deploy: pré-requisitos, informações antes do `tenant init` e a base do **gêmeo digital** (organograma, módulos, auditoria).

Os **dados de negócio do OrgOS ficam na sua infraestrutura**. A OpenOrgOS Community (`openorgos.net`) fornece protocolo, registro de módulos e recursos de aprendizado — não hospeda dados do tenant.

## Público-alvo

| Papel | Objetivo |
|------|------|
| **Steward Operator** | Executar o Org Console no hardware da empresa com pouco suporte de TI |
| **Fundador / patrocinador** | Entender o que preparar antes do go-live |
| **Steward (consultor)** | Validar o ambiente do cliente antes da entrega |

## Resultados

1. Máquina compatível pronta para OrgOS com Docker
2. Checklist de fatos organizacionais (estrutura, jurisdições, módulos)
3. Tenant inicializado com configuração validada
4. Escopo mínimo do gêmeo digital: organograma, módulos ativos e auditoria

## Fase 0 — Informações a reunir primeiro

Antes do `tenant init`, organize:

### Identidade organizacional

- Nome legal, nomes comerciais e jurisdição(ões) principal(is)
- Ano fiscal e moeda de reporte
- Contato diário do **Steward Operator**

### Estrutura (semente do gêmeo digital)

- Departamentos / equipes e linhas de reporte
- Papéis-chave — mapeie para [agentes Steward](/agents) quando útil
- Partes externas com quem troca org events

### Intenção de módulos

Consulte o [registro de módulos](/modules#registry):

| Área | Exemplos | Lançamento? |
|------|----------|-------------|
| Governança | propostas, comitês | Geralmente sim |
| Finanças | faturamento, contratos | Conforme necessidade |
| Operações | estoque, agendamento | Conforme necessidade |

### Limites de dados

- O que **nunca** deve sair do Mac mini (PII, contratos, detalhes contábeis)
- O que pode ser resumido em dashboards SaaS opcionais (somente leitura)

## Fase 1 — Hardware e rede

| Componente | Finalidade |
|------------|------------|
| **Mac mini** (ou host sempre ligado) | Org Runtime + Org Console — **fonte da verdade** |
| **Synology NAS** (opcional) | Backups, artefatos |
| LAN estável | Acesso interno ao Org Console |
| HTTPS de saída | GitHub, registro de módulos, heartbeat opcional |

## Fase 2 — Pré-requisitos de software

```bash
docker --version
docker compose version
git --version
```

- Conta **GitHub** com acesso ao repositório OrgOS / Steward
- Conta OpenOrgOS Community em [openorgos.net](/login)
- Arquivos `.env` apenas no host — nunca commitar credenciais

## Fase 3 — Clone e configuração

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Edite: TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

Corrija falhas de health check antes de continuar.

## Fase 4 — `tenant init` e validação

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Siga o README do repositório steward. Resolva todos os erros antes do go-live.

## Fase 5 — Baseline do gêmeo digital

| Camada | O que configurar |
|--------|------------------|
| **Identity** | Pessoas, papéis, contas vinculadas |
| **Authority** | Delegações, escopos de comitê |
| **Events** | Org events gerados por módulos |
| **Agents** | [Registro de agentes](/agents) |

- [ ] Papéis executivo e financeiro atribuídos a pessoas reais
- [ ] Pelo menos um org event de teste visível no Console
- [ ] Módulos ativos documentados no runbook
- [ ] Backup testado (DB + config)

## Fase 6 — Próximos passos

| Próximo | Link |
|---------|------|
| Operar com IA (Cursor) | [OrgOS com agentes de IA](/content/orgos-ai-agents) |
| Visão geral OrgOS | [Hub de aprendizado](/learning#about-orgos) |
| Currículo | [Aprendizado → Currículo](/learning#curriculum) |

## Solução de problemas

| Sintoma | Causa provável |
|---------|----------------|
| Falha OAuth | URL do navegador ≠ `AUTH_URL` no `.env` |
| Erro de conexão DB | Host `DATABASE_URL` incorreto na rede Docker |
| Módulo não carrega | Fora do registro ou desativado no tenant init |

## Leitura relacionada

- [Missão OpenOrgOS](/content/mission)
- [Modelo Stewardship](/content/stewardship-model)
- [Registro de agentes](/agents)
