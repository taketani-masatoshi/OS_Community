---
title: OrgOS-Installation und Vorbereitung des digitalen Zwillings
description: Installieren Sie OrgOS von Grund auf, sammeln Sie Organisationsinformationen und bereiten Sie die Umgebung für den digitalen Zwilling vor.
---

> **Überblick:** [Was ist OrgOS?](/learning#about-orgos) im Lern-Hub — deterministische Software, KI-Bedienung in natürlicher Sprache und modulare Erweiterung.

Dieser Leitfaden führt **Steward Operators** durch das erste Deployment: Voraussetzungen, Informationen vor `tenant init` und die Basis des **digitalen Zwillings** (Organigramm, Module, Audit).

**Geschäftsdaten von OrgOS bleiben auf Ihrer Infrastruktur**. OpenOrgOS Community (`openorgos.net`) liefert Protokoll, Modulregister und Lernressourcen — keine Tenant-Daten.

## Zielgruppe

| Rolle | Ziel |
|-------|------|
| **Steward Operator** | Org Console auf Firmenhardware mit wenig IT-Hintergrund |
| **Gründer / Sponsor** | Verstehen, was vor Go-live vorzubereiten ist |
| **Steward (Berater)** | Kundenumgebung vor Übergabe validieren |

## Ergebnisse

1. Unterstützte Maschine für Docker-basiertes OrgOS bereit
2. Checkliste organisatorischer Fakten (Struktur, Jurisdiktionen, Module)
3. Initialisierter Tenant mit validierter Konfiguration
4. Minimaler Umfang des digitalen Zwillings: Organigramm, aktive Module, Audit

## Phase 0 — Zuerst zu sammelnde Informationen

Vor `tenant init` organisieren:

### Organisationsidentität

- Rechtlicher Name, Handelsnamen, Hauptjurisdiktion(en)
- Geschäftsjahr und Berichtswährung
- Täglicher **Steward Operator**-Kontakt

### Struktur (Zwillings-Seed)

- Abteilungen / Teams und Berichtslinien
- Schlüsselrollen — zu [Steward-Agenten](/agents) zuordnen
- Externe Parteien für Org-Event-Austausch

### Modulabsicht

[Modulregister](/modules#registry) prüfen:

| Bereich | Beispiele | Start? |
|---------|-----------|--------|
| Governance | Vorschläge, Gremien | Oft ja |
| Finanzen | Rechnungen, Verträge | Nach Bedarf |
| Betrieb | Lager, Planung | Nach Bedarf |

### Datengrenzen

- Was **niemals** den Mac mini verlassen darf (PII, Verträge, Buchdetail)
- Was in optionale SaaS-Dashboards (nur Lesen) darf

## Phase 1 — Hardware und Netzwerk

| Komponente | Zweck |
|------------|-------|
| **Mac mini** (oder immer-an-Host) | Org Runtime + Org Console — **System of Record** |
| **Synology NAS** (optional) | Backups, Artefakte |
| Stabiles LAN | Interner Org-Console-Zugriff |
| Ausgehendes HTTPS | GitHub, Register, optional Heartbeat |

## Phase 2 — Software-Voraussetzungen

```bash
docker --version
docker compose version
git --version
```

- **GitHub**-Konto mit Zugriff auf OrgOS-/Steward-Repo
- OpenOrgOS-Community-Konto auf [openorgos.net](/login)
- `.env` nur auf dem Host — niemals Credentials committen

## Phase 3 — Klonen und konfigurieren

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Bearbeiten: TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

Health-Check-Fehler vor Fortsetzung beheben.

## Phase 4 — `tenant init` und Validierung

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Steward-Repo-README befolgen. Alle Fehler vor Go-live lösen.

## Phase 5 — Baseline digitaler Zwilling

| Schicht | Konfiguration |
|---------|---------------|
| **Identity** | Personen, Rollen, verknüpfte Konten |
| **Authority** | Delegationen, Gremien-Scopes |
| **Events** | Modul-generierte Org Events |
| **Agents** | [Agentenregister](/agents) |

- [ ] Führungs- und Finanzrollen echten Personen zugewiesen
- [ ] Mindestens ein Test-Org-Event in Console sichtbar
- [ ] Aktive Module im Runbook dokumentiert
- [ ] Backup getestet (DB + Config)

## Phase 6 — Nächste Schritte

| Weiter | Link |
|--------|------|
| Mit KI (Cursor) | [OrgOS mit KI-Agenten](/content/orgos-ai-agents) |
| OrgOS-Überblick | [Lern-Hub](/learning#about-orgos) |
| Curriculum | [Lernen → Curriculum](/learning#curriculum) |

## Fehlerbehebung

| Symptom | Wahrscheinliche Ursache |
|---------|-------------------------|
| OAuth schlägt fehl | Browser-URL ≠ `AUTH_URL` in `.env` |
| DB-Verbindungsfehler | Falscher `DATABASE_URL`-Host in Docker |
| Modul lädt nicht | Nicht im Register oder bei tenant init OFF |

## Weiterführende Links

- [OpenOrgOS-Mission](/content/mission)
- [Stewardship-Modell](/content/stewardship-model)
- [Agentenregister](/agents)
