---
title: OrgOS avec agents IA (Cursor)
description: Utilisez Cursor et des agents IA pour comprendre et exploiter OrgOS en langage naturel.
---

> **Aperçu :** [Qu'est-ce qu'OrgOS ?](/learning#about-orgos) sur le hub d'apprentissage — logiciel déterministe exploité via LLM et agents IA en langage naturel.

**Prérequis :** [Installation OrgOS et jumeau numérique](/content/orgos-install-setup) terminée, ou tenant local fonctionnel.

## Ce que font les agents

| Capacité | Exemple |
|----------|---------|
| **Expliquer** | « Que permet le manifest de l'agent finance ? » |
| **Naviguer** | « Quels modules sont activés pour ce tenant ? » |
| **Rédiger** | « Génère un modèle de proposition de comité pour la juridiction JP » |
| **Valider** | « Lance validate et résume les échecs » |
| **Exploiter** | « Liste les org events ouverts assignés à operations cette semaine » |

Les agents **ne remplacent pas la gouvernance**. Approbations, délégations et règles d'audit s'appliquent — traitez l'agent comme **assistant Steward**, pas exécutif autonome.

## Comment ça s'articule

```text
Vous (langage naturel)
    ↓
Agent Cursor (lit le dépôt + outils)
    ↓
Dépôt steward — agent.manifest.yaml, modules, scripts
    ↓
Org Runtime / Org Console (local — les données restent ici)
    ↓
Optionnel : OpenOrgOS Community (protocole et registre publics)
```

Les définitions centrales sont sous `steward/agents/`. Le [registre d'agents](/agents) Community est un catalogue public — le tenant peut étendre localement.

## Étape 1 — Ouvrir l'espace steward

1. Clonez le dépôt Steward / OrgOS de l'organisation (même hôte qu'Org Console).
2. Dans Cursor : **File → Open Folder** → racine du dépôt.
3. Vérifiez l'arborescence agents, ex. `steward/agents/executive/agent.manifest.yaml`.

Attendez l'indexation pour que `@Codebase` fonctionne.

## Étape 2 — Règles de projet (recommandé)

`.cursor/rules/orgos.mdc` ou **Cursor Settings → Rules** :

- Ne pas coller de données métier ni de secrets `.env` dans des chats publics
- Préférer l'inspection en lecture seule avant d'écrire
- Respecter juridiction et limites modules de `tenant.yaml` / `.env`
- Exécuter `./scripts/validate.sh` après changements de config

## Étape 3 — Connecter le contexte

| Source | Comment attacher dans Cursor |
|--------|------------------------------|
| Config tenant | `@.env.example`, `@tenant.yaml` (expurgé) |
| Organigramme | `@exports/org-chart.csv` |
| Liste modules | `@modules/enabled.json` ou lien registre |
| Notes onboarding | `@docs/onboarding-checklist.md` |
| Registre agents | `/agents` ou `@steward/agents/` |

## Étape 4 — Motifs en langage naturel

### Exploration (lecture seule)

- « Résume ce que l'agent compliance peut faire vs finance. »
- « Explique comment un org event est enregistré du module X au journal d'audit. »

### Configuration (brouillon → relecture)

- « Brouillon de liste de modules pour une PME de services de 20 personnes au JP — tableau. »
- « Explique la sortie de validate.sh ligne par ligne » (après exécution terminal)

### Opérations (prudence — local uniquement)

- « Liste les scripts touchant les données de production ; classe lecture vs écriture. »

Évitez les commandes destructives sans approbation humaine explicite.

## Étape 5 — Registre d'agents

Le [registre d'agents](/agents) mappe les domaines :

| Agent | Domaine | Questions typiques |
|-------|---------|-------------------|
| executive | governance | Stratégie, approbations, comités |
| secretary | governance | Agenda, procès-verbaux |
| finance | finance | Factures, politiques comptables |
| contract | finance | Cycle contrats |
| compliance | finance | Contrôles réglementaires |
| operations | operations | Files opérationnelles |

Synchronisez les manifests locaux après mises à jour du registre (`npm run sync:agents`).

## Étape 6 — MCP et terminal (optionnel)

- Préférez d'abord les outils MCP **lecture seule**
- Terminal pour `docker compose ps`, `validate.sh`, logs — collez la sortie dans le chat
- N'exposez pas les ports admin Org Console sur Internet

## Checklist sécurité

- [ ] Agent sur clone steward **local**
- [ ] Secrets `.env` — l'agent ne voit que des placeholders
- [ ] Écritures relues par Steward Operator
- [ ] Validate OK après modifications suggérées par l'agent

## Prochaines étapes

| Ressource | Lien |
|-----------|------|
| Installation et jumeau | [Guide d'installation](/content/orgos-install-setup) |
| Aperçu OrgOS | [Hub d'apprentissage](/learning#about-orgos) |
| Curriculum | [Apprentissage → Curriculum](/learning#curriculum) |
| Modules | [Registre de modules](/modules#registry) |
