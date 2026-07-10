---
title: Installation OrgOS et préparation du jumeau numérique
description: Installez OrgOS depuis zéro, rassemblez les informations organisationnelles et préparez l'environnement du jumeau numérique.
---

> **Aperçu :** [Qu'est-ce qu'OrgOS ?](/learning#about-orgos) sur le hub d'apprentissage — logiciel déterministe, exploitation IA en langage naturel et extension par modules.

Ce guide accompagne le **Steward Operator** lors du premier déploiement : prérequis, informations avant `tenant init` et base du **jumeau numérique** (organigramme, modules, audit).

Les **données métier OrgOS restent sur votre infrastructure**. OpenOrgOS Community (`openorgos.net`) fournit le protocole, le registre de modules et les ressources d'apprentissage — pas les données tenant.

## Public visé

| Rôle | Objectif |
|------|----------|
| **Steward Operator** | Faire tourner Org Console sur le matériel de l'entreprise avec peu de support IT |
| **Fondateur / sponsor** | Comprendre ce qu'il faut préparer avant le go-live |
| **Steward (consultant)** | Valider l'environnement client avant la passation |

## Résultats

1. Machine compatible prête pour OrgOS sous Docker
2. Checklist des faits organisationnels (structure, juridictions, modules)
3. Tenant initialisé avec configuration validée
4. Périmètre minimal du jumeau numérique : organigramme, modules actifs, audit

## Phase 0 — Informations à rassembler d'abord

Avant `tenant init`, organisez :

### Identité organisationnelle

- Nom légal, noms commerciaux et juridiction(s) principale(s)
- Exercice fiscal et devise de reporting
- Contact quotidien du **Steward Operator**

### Structure (graine du jumeau numérique)

- Départements / équipes et lignes hiérarchiques
- Rôles clés — mappez vers les [agents Steward](/agents) si utile
- Parties externes avec lesquelles vous échangez des org events

### Intention modules

Consultez le [registre de modules](/modules#registry) :

| Domaine | Exemples | Lancement ? |
|---------|----------|-------------|
| Gouvernance | propositions, comités | Souvent oui |
| Finance | facturation, contrats | Selon besoin |
| Opérations | stocks, planning | Selon besoin |

### Limites de données

- Ce qui ne doit **jamais** quitter le Mac mini (PII, contrats, détail comptable)
- Ce qui peut être résumé sur des tableaux de bord SaaS optionnels (lecture seule)

## Phase 1 — Matériel et réseau

| Composant | Rôle |
|-----------|------|
| **Mac mini** (ou hôte toujours allumé) | Org Runtime + Org Console — **source de vérité** |
| **Synology NAS** (optionnel) | Sauvegardes, artefacts |
| LAN stable | Accès interne à Org Console |
| HTTPS sortant | GitHub, registre, heartbeat optionnel |

## Phase 2 — Prérequis logiciels

```bash
docker --version
docker compose version
git --version
```

- Compte **GitHub** avec accès au dépôt OrgOS / Steward
- Compte OpenOrgOS Community sur [openorgos.net](/login)
- Fichiers `.env` sur l'hôte uniquement — ne jamais committer les identifiants

## Phase 3 — Clone et configuration

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Éditez : TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

Corrigez les échecs de health check avant de continuer.

## Phase 4 — `tenant init` et validation

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Suivez le README du dépôt steward. Résolvez toutes les erreurs avant le go-live.

## Phase 5 — Baseline du jumeau numérique

| Couche | À configurer |
|--------|--------------|
| **Identity** | Personnes, rôles, comptes liés |
| **Authority** | Délégations, périmètres de comité |
| **Events** | Org events générés par les modules |
| **Agents** | [Registre d'agents](/agents) |

- [ ] Rôles exécutif et finance assignés à des personnes réelles
- [ ] Au moins un org event de test visible dans Console
- [ ] Modules actifs documentés dans le runbook
- [ ] Sauvegarde testée (DB + config)

## Phase 6 — Prochaines étapes

| Suite | Lien |
|-------|------|
| Exploiter avec l'IA (Cursor) | [OrgOS avec agents IA](/content/orgos-ai-agents) |
| Aperçu OrgOS | [Hub d'apprentissage](/learning#about-orgos) |
| Curriculum | [Apprentissage → Curriculum](/learning#curriculum) |

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| Échec OAuth | URL navigateur ≠ `AUTH_URL` dans `.env` |
| Erreur connexion DB | Hôte `DATABASE_URL` incorrect dans Docker |
| Module ne charge pas | Hors registre ou désactivé au tenant init |

## Lectures associées

- [Mission OpenOrgOS](/content/mission)
- [Modèle Stewardship](/content/stewardship-model)
- [Registre d'agents](/agents)
