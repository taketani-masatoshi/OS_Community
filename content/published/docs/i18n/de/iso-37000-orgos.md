---
title: OrgOS und ISO 37000
description: Wie die OrgOS-Initialisierung eine praxisnahe Grundlage für eine ISO-37000-konforme Governance-Selbstdeklaration schafft.
---

# OrgOS und ISO 37000

**OrgOS** verbindet Organisationsaufbau und Governance: Beim Deploy und bei der **Initialisierung** entstehen Zweck, Rollen, Aufsicht und Nachvollziehbarkeit als eine Baseline.

Diese Baseline trägt eine glaubwürdige **Selbstdeklaration** der Ausrichtung an **ISO 37000** (*Governance of organizations* — Leitlinie). Die OpenOrgOS Community stellt keine Dritt-ISO-Zertifikate aus.

## Was die Community bereitstellt

OpenOrgOS Community ist ein **neutrales Zuhause** für Protokoll, Module, Lernen und Operator-Pfade. Governance-Aussagen, Richtlinien und Kultur bleiben Verantwortung jeder Mitgliedsorganisation.

| Begriff | Definition |
|---------|------------|
| **OrgOS** | Organisations-Runtime auf Infrastruktur, die Sie kontrollieren |
| **OOO** | [OpenOrgOS Operator](/certifications) — Referenzrolle für Deploy und Betrieb |
| **ISO 37000** | Internationale Leitlinie zur Governance von Organisationen |
| **Selbstdeklaration** | Eigene Aussage der Organisation — kein akkreditiertes Zertifikat |

ISO 37000 ist **Guidance**, kein zertifizierbares Anforderungsdokument wie ISO 9001. OrgOS macht die Bewertung **betriebsfähig und evidenzbasiert**.

## Ablauf

1. **Deploy** — OrgOS auf eigener Hardware ([Installationsleitfaden](/content/orgos-install-setup))
2. **Vorbereiten** — Rechtsform, Struktur, Rechtsräume, Module
3. **Initialisieren** — `orgos tenant init` schreibt Zweck-Skelett und ISO-37000-Entwurf
4. **Prüfen** — `orgos governance principles status`. Platzhalter-Mission zählt nicht als ready
5. **Deklarieren** — nur ein Mensch: `orgos governance principles declare --signatory "…"`

Ein **OpenOrgOS Operator (OOO)** führt den Weg üblicherweise.

## Themen (illustrativ)

| ISO-37000-Prinzip | Was OrgOS stützt |
|-------------------|------------------|
| **Purpose** | Mission, Vision, Werte im Geschäftsplan |
| **Value and strategy** | Pläne, KPI, Budgettore |
| **Oversight** | Unternehmensereignisse, Board-Akten, Operator Console |
| **Accountability** | Benannte Operator, RBAC, kein Selbstgenehmigen; Auditor-Sitz oder Ausgleichskontrolle |
| **Stakeholders** | Berater, Governance-Register, IR / Wire |
| **Leadership** | Menschliche Endgenehmigung, Login-Domain, PassKey |
| **Data and decisions** | YAML-Quelle, Analytics, Dashboards |
| **Risk** | Risikoregister; ISMS-Risikoakten bei ISO 27001 |
| **Social responsibility** | ESG / Umweltregelungen wo zutreffend |
| **Viability** | Mehrjahrespläne, Schuldenplan, Tenant-Lebenszyklus |

## Umfang der „Bereitschaft zur Selbstdeklaration“

**Im Umfang:** laufende Struktur und Entscheidungsspur; Pfad Zweck → Struktur → Aufsicht; `orgos governance principles status`.

**Außerhalb:** automatische ISO-Zertifizierung durch die Community; Rechtsberatung; ISO 37001 (Bestechungsbekämpfung) oder ISO 37301 (CMS) — eigene Packs.

## Nächste Schritte

| Aktion | Ressource |
|--------|-----------|
| OrgOS verstehen | [Learning](/learning#about-orgos) |
| Deploy | [OrgOS Install](/content/orgos-install-setup) |
| Operator-Pfad | [Certifications](/certifications) |
| Community-Governance | [Governance](/governance) |
