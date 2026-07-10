---
title: OrgOS mit KI-Agenten (Cursor)
description: Nutzen Sie Cursor und KI-Agenten, um OrgOS in natürlicher Sprache zu verstehen und zu bedienen.
---

> **Überblick:** [Was ist OrgOS?](/learning#about-orgos) im Lern-Hub — deterministische Software, bedient via LLMs und KI-Agenten in natürlicher Sprache.

**Voraussetzung:** [OrgOS-Installation und digitaler Zwilling](/content/orgos-install-setup) abgeschlossen oder funktionierender lokaler Tenant.

## Was Agenten tun

| Fähigkeit | Beispiel |
|-----------|----------|
| **Erklären** | «Was erlaubt das Finance-Agent-Manifest?» |
| **Navigieren** | «Welche Module sind für diesen Tenant aktiv?» |
| **Entwerfen** | «Erstelle eine Gremienvorschlagsvorlage für JP-Jurisdiktion» |
| **Validieren** | «Führe validate aus und fasse Fehler zusammen» |
| **Betreiben** | «Zeige offene Org Events für operations diese Woche» |

Agenten **ersetzen keine Governance**. Genehmigungen, Delegationen und Audit-Regeln gelten — behandeln Sie den Agenten als **Steward-Assistent**, nicht als autonomen Executive.

## Zusammenspiel

```text
Sie (natürliche Sprache)
    ↓
Cursor-Agent (liest Repo + Tools)
    ↓
Steward-Repo — agent.manifest.yaml, Module, Skripte
    ↓
Org Runtime / Org Console (lokal — Daten bleiben hier)
    ↓
Optional: OpenOrgOS Community (nur öffentliches Protokoll & Register)
```

Kernagenten-Definitionen unter `steward/agents/`. Das Community-[Agentenregister](/agents) ist ein öffentlicher Katalog — der Tenant kann lokal erweitern.

## Schritt 1 — Steward-Workspace öffnen

1. Steward-/OrgOS-Repo der Organisation klonen (gleicher Host wie Org Console).
2. In Cursor: **File → Open Folder** → Repo-Wurzel.
3. Agentenbaum prüfen, z. B. `steward/agents/executive/agent.manifest.yaml`.

Indexierung abwarten, damit `@Codebase` funktioniert.

## Schritt 2 — Projektregeln (empfohlen)

`.cursor/rules/orgos.mdc` oder **Cursor Settings → Rules**:

- Keine Geschäftsdaten oder `.env`-Geheimnisse in öffentliche Chats
- Vor Schreibvorschlägen nur-Lesen-Inspektion bevorzugen
- Jurisdiktion und Modulgrenzen aus `tenant.yaml` / `.env` einhalten
- `./scripts/validate.sh` nach Config-Änderungen ausführen

## Schritt 3 — Kontext verbinden

| Quelle | Anhängen in Cursor |
|--------|-------------------|
| Tenant-Config | `@.env.example`, `@tenant.yaml` (redigiert) |
| Organigramm | `@exports/org-chart.csv` |
| Modulliste | `@modules/enabled.json` oder Register-Link |
| Onboarding-Notizen | `@docs/onboarding-checklist.md` |
| Agentenregister | `/agents` oder `@steward/agents/` |

## Schritt 4 — Muster in natürlicher Sprache

### Exploration (nur Lesen)

- «Fasse zusammen, was Compliance vs. Finance darf.»
- «Erkläre den Weg eines Org Events von Modul X zum Audit-Log.»

### Konfiguration (Entwurf → Review)

- «Entwurf Modul-Liste für 20-Personen-Dienstleister in JP — Tabelle.»
- «Erkläre validate.sh-Ausgabe Zeile für Zeile» (nach Terminal-Lauf)

### Betrieb (vorsichtig — nur lokal)

- «Liste Skripte mit Produktionsdaten; klassifiziere Lesen vs. Schreiben.»

Destruktive Befehle ohne explizite menschliche Freigabe vermeiden.

## Schritt 5 — Agentenregister

Das [Agentenregister](/agents) mappt Domänen:

| Agent | Domäne | Typische Fragen |
|-------|--------|-----------------|
| executive | governance | Strategie, Genehmigungen |
| secretary | governance | Termine, Protokolle |
| finance | finance | Rechnungen, Buchführung |
| contract | finance | Vertragszyklus |
| compliance | finance | Regulatorische Prüfungen |
| operations | operations | Operative Warteschlangen |

Lokale Manifests nach Register-Updates synchronisieren (`npm run sync:agents`).

## Schritt 6 — MCP und Terminal (optional)

- Zuerst **nur-Lesen**-MCP-Tools bevorzugen
- Terminal für `docker compose ps`, `validate.sh`, Logs — Ausgabe in Chat einfügen
- Org-Console-Admin-Ports nicht ins Internet stellen

## Sicherheits-Checkliste

- [ ] Agent gegen **lokalen** Steward-Klon
- [ ] `.env`-Geheimnisse — Agent sieht nur Platzhalter
- [ ] Schreiboperationen vom Steward Operator geprüft
- [ ] Validate nach Agent-Vorschlägen bestanden

## Nächste Schritte

| Ressource | Link |
|-----------|------|
| Installation & Zwilling | [Installationsleitfaden](/content/orgos-install-setup) |
| OrgOS-Überblick | [Lern-Hub](/learning#about-orgos) |
| Curriculum | [Lernen → Curriculum](/learning#curriculum) |
| Module | [Modulregister](/modules#registry) |
