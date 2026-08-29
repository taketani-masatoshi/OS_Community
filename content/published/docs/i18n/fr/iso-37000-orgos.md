---
title: OrgOS et ISO 37000
description: Comment l'initialisation d'OrgOS soutient une autodéclaration de gouvernance alignée sur l'ISO 37000.
---

# OrgOS et ISO 37000

**OrgOS** relie déploiement et gouvernance : à l'**initialisation**, finalité, rôles, supervision et traçabilité forment une même base.

Cette base soutient une **autodéclaration** crédible d'alignement sur **ISO 37000** (*Governance of organizations* — lignes directrices). OpenOrgOS Community n'émet pas de certificats ISO tiers.

## Ce que fournit la communauté

OpenOrgOS Community est un **foyer neutre** pour protocole, modules, apprentissage et opérateurs. Les déclarations de gouvernance restent la responsabilité de chaque organisation.

| Terme | Définition |
|--------|------------|
| **OrgOS** | Runtime organisationnel sur une infrastructure que vous contrôlez |
| **OOO** | [OpenOrgOS Operator](/certifications) — rôle de référence pour le déploiement |
| **ISO 37000** | Lignes directrices internationales sur la gouvernance des organisations |
| **Autodéclaration** | Déclaration propre — distincte d'une certification accréditée |

L'ISO 37000 est une **guidance**, pas une norme certifiable comme l'ISO 9001. OrgOS rend l'évaluation **opérationnelle et fondée sur des preuves**.

## Séquence

1. **Déployer** — OrgOS sur matériel maîtrisé ([guide d'installation](/content/orgos-install-setup))
2. **Préparer** — identité légale, structure, juridictions, modules
3. **Initialiser** — `orgos tenant init` écrit un squelette de finalité et un brouillon ISO 37000
4. **Évaluer** — `orgos governance principles status`. Un mission placeholder n'est pas ready
5. **Déclarer** — un humain seulement : `orgos governance principles declare --signatory "…"`

Un **OpenOrgOS Operator (OOO)** mène généralement le parcours.

## Thèmes (illustratifs)

| Principe ISO 37000 | Ce qu'OrgOS aide à établir |
|--------------------|---------------------------|
| **Purpose** | Mission, vision et valeurs dans le plan d'affaires |
| **Value and strategy** | Plans, KPI, seuils budgétaires |
| **Oversight** | Événements d'entreprise, procès-verbaux, Operator Console |
| **Accountability** | Opérateurs nommés, RBAC, pas d'auto-approbation |
| **Stakeholders** | Conseillers, registre de gouvernance, IR / Wire |
| **Leadership** | Approbation humaine finale, domaine de connexion, PassKey |
| **Data and decisions** | YAML comme source de vérité, analytics, tableaux de bord |
| **Risk** | Registre des risques ; ISMS si ISO 27001 est actif |
| **Social responsibility** | ESG / règles environnementales le cas échéant |
| **Viability** | Plans pluriannuels, dette, cycle de vie du tenant |

## Périmètre de la « préparation à l'autodéclaration »

**Dans le périmètre :** structure opérationnelle et piste de décision ; parcours finalité → structure → supervision ; `orgos governance principles status`.

**Hors périmètre :** certification ISO automatique ; conseil juridique ; ISO 37001 (anti-corruption) ou ISO 37301 (CMS) — packs distincts.

## Étapes suivantes

| Action | Ressource |
|--------|-----------|
| Comprendre OrgOS | [Learning](/learning#about-orgos) |
| Déployer | [OrgOS Install](/content/orgos-install-setup) |
| Opérateur | [Certifications](/certifications) |
| Gouvernance communautaire | [Governance](/governance) |
