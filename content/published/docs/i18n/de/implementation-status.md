---
title: OpenOrgOS-Implementierungsstatus
description: Globales Protokoll, Wire, Community-Website, Commercial Hub und nationale Gateways wie X-Road — was heute live ist
---

> **Zielgruppe:** Stewards, Komiteemitglieder, Integratoren und Partner, die OpenOrgOS bewerten.  
> **Aktualisiert:** 2026-07 — Community in Phase 0; Hub und nationale Gateway-Adapter nach Rechtsraum.  
> **Kanonische Protokollquelle:** OrgOS-Referenzrepo — bei Widerspruch zwischen dieser Seite und dem Repo **gilt das Repo**.

## Auf einen Blick

OpenOrgOS umfasst **drei trennbare Schichten**. Verwechseln Sie Fortschritt in einer Schicht nicht mit Fortschritt in einer anderen.

| Schicht | Was es ist | Status |
|---------|------------|--------|
| **Globales Protokoll** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Definiert** — Vokabular und Architektur im OrgOS-Repo |
| **Wire · Witness** | Interorganisationeller Transport und prüfbare Evidenz | **Spezifiziert** — Referenzimplementierung in OrgOS; kein Community-Produkt |
| **OrgOS-Runtime** | On-Premises-Steward-Stack (Core, Modules, Agents, CLI) | **Verfügbar** — installierbar; Module je nach Domäne |
| **OpenOrgOS Community** (diese Site) | OSS-Register, Komitees, Governance, Lernen | **Live** — Phase 0 |
| **Commercial Hub** | Marketplace für kostenpflichtige Module je Rechtsraum | **Phase 0→1** — noch kein Verkauf |
| **Nationale Gateways** (X-Road-Klasse) | Adapter an sichere Landes-/Regionalnetze | **Geplant** — kein ausgelieferter Adapter; Rechtsraummodule definieren Mapping |

**Sie sind hier:** Community und WILD-Register sind betriebsbereit. Hub-Verkauf und X-Road-Klassen-Adapter sind **Design- und Cohort-Arbeit**, keine Live-Integrationen auf dieser Site.

---

## Globale Protokollschicht

Die **globale Schicht bleibt dünn**. Sie definiert, *wie* Organisationen Zustand über Grenzen austauschen — nicht lokale Geschäftsregeln.

| Fähigkeit | Definition | Runtime |
|-----------|------------|---------|
| **Org Event Model** | In Mission und OrgOS-Vokabular dokumentiert | Events in OrgOS; **Cross-Org-Relay ist P2** (siehe Wire) |
| **Identity Exchange** | Definiert | Heute tenant-lokal; föderierter Austausch **mit Wire geplant** |
| **Authority Delegation** | In Modulen und Agent-Grenzen definiert | Im Tenant operativ; Cross-Org-Delegation **über Wire** |
| **Auditability** | Definiert (Witness, Timelines) | Im Tenant operativ |

Terminologie (Module vs Agent vs Wire): [Module and Agent](/content/module-and-agent).

---

## Wire und Witness

**Wire** ist **kein** Module-, Agent- oder Hub-Produkt. Es ist der **Protokolltransport** für Org-to-Org-Nachrichten und -Events. **Witness** deckt prüfbare Evidenz für Dritte ab.

### Wo Wire in OrgOS sitzt

| # | Komponente | Rolle |
|---|------------|-------|
| 1 | **OpenOrgOS Core** | Regelengine, Tenant-Config, CLI |
| 2 | **Module linkage** | Domänen-Packs (Buchhaltung, Medizinprodukte, …) |
| 3 | **Wire · Witness** | Grenzüberschreitender Austausch und Audit-Evidenz |
| — | **Agents** | Begrenzte LLM-Operatoren *im* Tenant |

Häufige Korrektur: **„Agent sendet Wire“** ist falsch. Wire ist Protokollebene; Agents **entwerfen**; Menschen **genehmigen**; **CLI / Skill** führt deterministisch aus.

### Implementierungsstatus

| Punkt | Status |
|-------|--------|
| Vokabular und Architektur (`orgos-vocabulary.md` usw.) | **Veröffentlicht** im OrgOS-Repo |
| Tenant-interne Operationen (Skills, CLI, Agents, Modules) | **Nutzerbar** auf installiertem OrgOS |
| **Org Event Relay** (Inter-Org-Gateway) | **P2 geplant** — Control-Plane-Backlog; nicht live auf Community |
| Öffentlicher Wire-Endpoint auf `community.oorgos.org` | **Nicht angeboten** — Community ist Register/Governance, kein Wire-Hub |

Das Relay **ersetzt** keine rechtsspezifischen Gateways; es trägt **OpenOrgOS-förmige Events** zwischen teilnehmenden Orgs.

---

## Commercial Hub

Der **Hub** ist der **Commercial-Kanal** — lizenzierte Betreiber verkaufen und supporten Module **pro Rechtsraum**. Getrennt von Community-Review.

| Punkt | Status |
|-------|--------|
| WILD + Community-Modulregister auf dieser Site | **Live** — [/modules](/modules) |
| Komitees und Governance | **Live** — [/committees](/committees), [/governance](/governance) |
| Candidate-Pipeline + Program Fund | **Phase-1-Vorbereitung** — Cohort und Assess definiert, nicht voll automatisiert |
| Commercial-Hub-Marketplace | **Nicht live** — erster Rechtsraum-Cohort in Arbeit |
| Agent-Produkte im Hub | **Derzeit außerhalb des Scopes** — Module zuerst |

Rollout-Phasen (Detail): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ Commercial-ready.** Commercial-Listing erfordert **Hub-Pfad**, nicht nur Register-Promotion.

---

## X-Road und nationale Austausch-Gateways

### Was X-Road ist

**[X-Road](https://x-road.global/)** ist eine **nationale (oder regionale) sichere Datenaustauschschicht** — Mitgliedsorganisationen verbinden sich über Security Server; Zugriff durch Policy und Vertrag (Estland, Finnland, andere NIIS-Mitglieder).

X-Road beantwortet: *„Wie verbindet meine Organisation sich mit dem vertrauenswürdigen Austausch-Gefüge des **Landes**?“*

### Bezug zu OpenOrgOS

| | **OpenOrgOS Wire** | **X-Road-Klassen-Gateway** |
|---|-------------------|----------------------------|
| Umfang | **Org-to-Org**-Event- und Zustandsaustausch in OpenOrgOS-Form | Mitgliedschaft in **nationaler Infrastruktur** und technisches Gateway |
| Eigentümer | Teilnehmende Orgs + Protokoll-Spec | Landes-/Regionalbetreiber (z. B. NIIS-Mitglieder) |
| Inhalt | Org-Events, Delegation, Audit-Umschläge | Mitgliedsspezifische Nachrichten und nationale Schemas |
| OpenOrgOS-Rolle | **Semantisches Modell** und Steward-Runtime | **Ersetzt X-Road nicht** — **Interop**, wo Komitees es verlangen |

OpenOrgOS **liefert heute keinen produktiven X-Road-Adapter**. Grenzüberschreitende/öffentliche Szenarien kombinieren:

1. **OrgOS-Runtime** (lokale Source of Truth),
2. **Wire** (OpenOrgOS Org-to-Org-Events, wenn Relay verfügbar),
3. **Rechtsraummodul + Gateway-Adapter** (Mapping nationale Gateway-Nachrichten ↔ Org Event Model).

### Status und nächste Schritte

| Punkt | Status |
|-------|--------|
| X-Road-Adapter-Modul im Community-Register | **Noch keines gelistet** |
| Referenzadapter im OrgOS-Repo | **Nicht ausgeliefert** |
| Komitee-Charta öffentlicher Sektor / Gateway-Interop | **Willkommen** — Domänen- und Rechtsraumkomitees |
| OOO-RFC-Pfad für Gateway-Profile | **Verfügbar** — Standards via OOO Program |

In X-Road-Mitgliedsumgebung: **Rechtsraummodul vorschlagen** oder relevantem [Komitee](/committees) beitreten — Gateway-Mapping sind **lokale Regeln**, nicht globales Protokoll.

---

## OpenOrgOS Community Site (diese Website)

Was `community.oorgos.org` heute implementiert:

| Fähigkeit | Status |
|-----------|--------|
| Modulregister (WILD, Lifecycle) | **Live** |
| Wild-Module-Vorschläge | **Live** |
| Komitees und Domänen-Governance | **Live** |
| Zertifizierungen und Rollenanfragen | **Live** |
| Identity (Google; GitHub / LinkedIn Connect) | **Live** |
| Lernleitfäden und Docs (`/content/*`) | **Live** |
| Academy-Tracks | **Teilweise** — abhängig von Academy-Konfiguration |
| Commercial Hub / Zahlungen | **Nicht auf dieser Site** |
| Wire / Org-Event-Ingress | **Nicht auf dieser Site** |

Infrastruktur: Übersicht auf [oorgos.org](https://oorgos.org); Community auf Steward-Deployment + Cloudflare Tunnel (Runbooks in Repo `docs/`).

---

## OrgOS-Runtime (On-Premises)

Für Stewards, die OrgOS auf eigener Hardware installieren:

| Punkt | Status |
|-------|--------|
| Install- und Digital-Twin-Leitfaden | **Veröffentlicht** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core Agents (Finance, Secretary, Steward, …) | **Verfügbar** im Referenzstack |
| Domänenmodule (rental, jp_medical_device, …) | **Variiert** — [/modules](/modules) |
| Control-Plane-Heartbeat / Outbound Agent | **Architektur definiert** — `docs/plans/` |
| Org Event Relay zu anderen Orgs | **P2 — nicht GA** |

---

## Roadmap-Zusammenfassung

| Phase | Fokus | Repräsentative Deliverables |
|-------|-------|----------------------------|
| **Jetzt (Phase 0)** | Community OSS, Register, Komitees | Diese Site, WILD, Governance |
| **Phase 0→1** | Erster Hub-Cohort | Manueller Commercial-Pfad in einem Rechtsraum |
| **Phase 1–2** | Candidate + Assess + Program Fund | Bezahlte Audit-Prep-Pipeline |
| **Protokoll P2** | Org Event Relay (Wire-Gateway) | Cross-Org-Event-Transport |
| **Pro Rechtsraum** | X-Road / nationale Gateway-Adapter | Modul- + Komitee-definiertes Mapping |

---

## Verwandte Links

| Ressource | Link |
|-----------|------|
| Module ecosystem (Hub-Phasen) | [/content/module-ecosystem](/content/module-ecosystem) |
| Terminologie Module / Agent / Wire | [/content/module-and-agent](/content/module-and-agent) |
| Mission und globales Protokoll | [/content/mission](/content/mission) |
| Modulregister | [/modules](/modules) |
| Governance | [/governance](/governance) |
| OrgOS-Installationsleitfaden | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Alle Docs | [/content](/content) |
