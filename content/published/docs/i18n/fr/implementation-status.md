---
title: État d'implémentation OpenOrgOS
description: Protocole global, Wire, site Community, Commercial Hub et passerelles nationales comme X-Road — ce qui est en service aujourd'hui
---

> **Public :** Stewards, membres de comités, intégrateurs et partenaires évaluant OpenOrgOS.  
> **Mis à jour :** 2026-07 — Community en Phase 0 ; Hub et adaptateurs de passerelle nationale par juridiction.  
> **Source canonique du protocole :** dépôt OrgOS — en cas de divergence entre cette page et le repo, **le repo prime**.

## En bref

OpenOrgOS comprend **trois couches séparables**. Ne confondez pas les progrès d'une couche avec ceux d'une autre.

| Couche | Nature | État |
|--------|--------|------|
| **Protocole global** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Défini** — vocabulaire et architecture dans le repo OrgOS |
| **Wire · Witness** | Transport inter-organisationnel et preuve vérifiable | **Spécifié** — implémentation de référence dans OrgOS ; pas un produit Community |
| **Runtime OrgOS** | Stack steward on-premises (Core, Modules, Agents, CLI) | **Disponible** — installable ; modules variables selon le domaine |
| **OpenOrgOS Community** (ce site) | Registre OSS, comités, gouvernance, apprentissage | **En service** — Phase 0 |
| **Commercial Hub** | Marketplace de modules payants par juridiction | **Phase 0→1** — pas encore de ventes |
| **Passerelles nationales** (classe X-Road) | Adaptateurs aux réseaux d'échange sécurisés pays/région | **Planifié** — aucun adaptateur livré ; modules de juridiction définissent le mapping |

**Vous êtes ici :** Community et registre WILD opérationnels. Ventes Hub et adaptateurs classe X-Road : **travail de conception et cohort**, pas d'intégrations live sur ce site.

---

## Couche protocole global

La **couche globale reste mince**. Elle définit *comment* les organisations échangent l'état au-delà des frontières — pas les règles métier locales.

| Capacité | Définition | Runtime |
|----------|------------|---------|
| **Org Event Model** | Documenté dans la mission et le vocabulaire OrgOS | Événements enregistrés dans OrgOS ; **relay inter-org en P2** (voir Wire) |
| **Identity Exchange** | Défini | Identité locale au tenant aujourd'hui ; échange fédéré **prévu avec Wire** |
| **Authority Delegation** | Défini dans modules et limites d'agents | Opérationnel dans le tenant ; délégation inter-org **via Wire** |
| **Auditability** | Défini (Witness, timelines) | Opérationnel dans le tenant |

Terminologie (Module vs Agent vs Wire) : [Module and Agent](/content/module-and-agent).

---

## Wire et Witness

**Wire** **n'est pas** un Module, Agent ou produit Hub. C'est le **transport de protocole** pour messages et événements org-to-org. **Witness** couvre les preuves vérifiables par des tiers.

### Place de Wire dans OrgOS

| # | Composant | Rôle |
|---|-----------|------|
| 1 | **OpenOrgOS Core** | Moteur de règles, config tenant, CLI |
| 2 | **Module linkage** | Packs domaine (comptabilité, dispositifs médicaux, …) |
| 3 | **Wire · Witness** | Échange transfrontalier et preuve d'audit |
| — | **Agents** | Opérateurs LLM bornés *dans* le tenant |

Correction courante : **« L'Agent envoie Wire »** est faux. Wire est au niveau protocole ; les agents **rédigent** ; les humains **approuvent** ; **CLI / Skill** exécute de façon déterministe.

### État d'implémentation

| Élément | État |
|---------|------|
| Vocabulaire et architecture (`orgos-vocabulary.md`, etc.) | **Publié** dans le repo OrgOS |
| Opérations tenant (Skills, CLI, agents, modules) | **Utilisable** sur OrgOS installé |
| **Org Event relay** (passerelle inter-org) | **P2 planifié** — backlog Control Plane ; pas live sur Community |
| Endpoint Wire public sur `community.oorgos.org` | **Non proposé** — Community = registre/gouvernance, pas hub Wire |

Le relay ne **remplacera pas** les passerelles jurisdictionnelles ; il transporte des **événements OpenOrgOS** entre orgs participantes.

---

## Commercial Hub

Le **Hub** est le **canal Commercial** — opérateurs licenciés vendent et supportent des modules **par domaine juridique**. Séparé de la revue Community.

| Élément | État |
|---------|------|
| Registre WILD + Community sur ce site | **En service** — [/modules](/modules) |
| Comités et gouvernance | **En service** — [/committees](/committees), [/governance](/governance) |
| Pipeline Candidate + Program Fund | **Préparation Phase 1** — cohort et Assess définis, pas entièrement automatisés |
| Marketplace Commercial Hub | **Pas en service** — premier cohort jurisdictionnel en cours |
| Produits Agent dans le Hub | **Hors périmètre pour l'instant** — modules d'abord |

Phases (détail) : [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ prêt Commercial.** Listing Commercial exige un **chemin Hub**, pas seulement une promotion registre.

---

## X-Road et passerelles d'échange nationales

### Qu'est-ce que X-Road

**[X-Road](https://x-road.global/)** est une **couche nationale (ou régionale) d'échange sécurisé de données** — organisations membres connectées via security servers ; accès gouverné par politique et contrat (Estonie, Finlande, autres membres NIIS).

X-Road répond : *« Comment mon organisation se connecte-t-elle au tissu d'échange de confiance du **pays** ? »*

### Rapport avec OpenOrgOS

| | **OpenOrgOS Wire** | **Passerelle classe X-Road** |
|---|-------------------|------------------------------|
| Périmètre | Échange **org-to-org** en forme OpenOrgOS | Adhésion à **infrastructure nationale** et passerelle technique |
| Propriétaire | Orgs participantes + spec protocole | Opérateur pays/région (ex. membres NIIS) |
| Contenu | Événements org, délégation, enveloppes audit | Messages spécifiques et schémas nationaux |
| Rôle OpenOrgOS | **Modèle sémantique** et runtime steward | **Ne remplace pas** X-Road — **interop** où les comités l'exigent |

OpenOrgOS **ne livre pas aujourd'hui d'adaptateur X-Road de production**. Scénarios transfrontaliers/secteur public combinent :

1. **Runtime OrgOS** (source de vérité locale),
2. **Wire** (événements org-to-org OpenOrgOS, quand relay disponible),
3. **Module juridiction + adaptateur passerelle** (mapping messages passerelle ↔ Org Event Model).

### État et prochaines étapes

| Élément | État |
|---------|------|
| Module adaptateur X-Road dans registre Community | **Aucun listé encore** |
| Adaptateur de référence dans repo OrgOS | **Non livré** |
| Charte comité secteur public / interop passerelle | **Bienvenue** — comités domaine et juridiction |
| Voie RFC OOO pour profils passerelle | **Disponible** — standards via OOO Program |

En environnement membre X-Road, **proposez un module de juridiction** ou rejoignez le [comité](/committees) pertinent — le mapping passerelle relève de **règles locales**, pas du protocole global.

---

## Site OpenOrgOS Community (ce site web)

Ce que `community.oorgos.org` implémente aujourd'hui :

| Capacité | État |
|----------|------|
| Registre modules (WILD, lifecycle) | **En service** |
| Propositions wild module | **En service** |
| Comités et gouvernance domaine | **En service** |
| Certifications et demandes de rôle | **En service** |
| Identity (Google ; GitHub / LinkedIn connect) | **En service** |
| Guides et docs (`/content/*`) | **En service** |
| Parcours Academy | **Partiel** — dépend config Academy |
| Commercial Hub / paiements | **Pas sur ce site** |
| Wire / ingress Org Event | **Pas sur ce site** |

Infrastructure : vue d'ensemble sur [oorgos.org](https://oorgos.org) ; Community en déploiement steward + Cloudflare Tunnel (runbooks dans `docs/`).

---

## Runtime OrgOS (on-premises)

Pour stewards installant OrgOS sur leur propre matériel :

| Élément | État |
|---------|------|
| Guide install et digital twin | **Publié** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Disponibles** dans stack de référence |
| Modules domaine (rental, jp_medical_device, …) | **Variable** — [/modules](/modules) |
| Heartbeat Control Plane / outbound agent | **Architecture définie** — `docs/plans/` |
| Org Event relay vers autres orgs | **P2 — pas GA** |

---

## Résumé roadmap

| Phase | Focus | Livrables représentatifs |
|-------|-------|--------------------------|
| **Maintenant (Phase 0)** | OSS Community, registre, comités | Ce site, WILD, gouvernance |
| **Phase 0→1** | Premier cohort Hub | Chemin Commercial manuel dans une juridiction |
| **Phase 1–2** | Candidate + Assess + Program Fund | Pipeline prep audit payant |
| **Protocole P2** | Org Event relay (passerelle Wire) | Transport événements inter-org |
| **Par juridiction** | Adaptateurs X-Road / passerelle nationale | Mapping module + comité |

---

## Liens connexes

| Ressource | Lien |
|-----------|------|
| Module ecosystem (phases Hub) | [/content/module-ecosystem](/content/module-ecosystem) |
| Terminologie Module / Agent / Wire | [/content/module-and-agent](/content/module-and-agent) |
| Mission et protocole global | [/content/mission](/content/mission) |
| Registre modules | [/modules](/modules) |
| Gouvernance | [/governance](/governance) |
| Guide install OrgOS | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Tous les docs | [/content](/content) |
