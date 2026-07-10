---
title: OrgOS AI agentidega (Cursor)
description: Kasutage Cursorit ja AI agente OrgOS-i mõistmiseks ja haldamiseks looduslikus keeles.
---

> **Ülevaade:** [Mis on OrgOS?](/learning#about-orgos) õppekeskuses — deterministlik tarkvara, mida opereeritakse LLM-ide ja AI agentide kaudu looduslikus keeles.

**Eeltingimus:** [OrgOS paigaldus ja digitaalne kaksik](/content/orgos-install-setup) valmis või töötav kohalik tenant.

## Mida agendid teevad

| Võime | Näide |
|-------|-------|
| **Selgitada** | «Mida finance agendi manifest lubab?» |
| **Navigeerida** | «Millised moodulid on selles tenant'is aktiivsed?» |
| **Koostada** | «Koosta komitee ettepaneku mall JP jurisdiktsioonile» |
| **Valideerida** | «Käivita validate ja võta vead kokku» |
| **Operatsioon** | «Näita selle nädala operations org evente» |

Agendid **ei asenda juhtimist**. Kinnitused, delegeerimised ja audit reeglid kehtivad — kohtle agenti **Steward assistendina**.

## Kuidas see kokku sobib

```text
Sina (looduslik keel)
    ↓
Cursor agent (loeb repot + tööriistu)
    ↓
Steward repo — agent.manifest.yaml, moodulid, skriptid
    ↓
Org Runtime / Org Console (kohalik — andmed jäävad siia)
    ↓
Valikuline: OpenOrgOS Community (avalik protokoll ja register)
```

Tuumaagentide definitsioonid on `steward/agents/`. Community [agentide register](/agents) on avalik kataloog.

## Samm 1 — Ava steward tööruum

1. Klooni organisatsiooni Steward / OrgOS repo (sama host mis Org Console).
2. Cursoris: **File → Open Folder** → repo juur.
3. Kontrolli agentide puud, nt `steward/agents/executive/agent.manifest.yaml`.

Oota indekseerimist, et `@Codebase` töötaks.

## Samm 2 — Projekti reeglid (soovitatav)

`.cursor/rules/orgos.mdc` või **Cursor Settings → Rules**:

- Ära kleebi äriandmeid ega `.env` saladusi avalikesse vestlustesse
- Eelista enne kirjutamist ainult lugemist
- Järgi `tenant.yaml` / `.env` jurisdiktsiooni ja moodulite piire
- Käivita `./scripts/validate.sh` pärast config muudatusi

## Samm 3 — Ühenda kontekst

| Allikas | Kuidas Cursoris |
|---------|-----------------|
| Tenant config | `@.env.example`, `@tenant.yaml` (redigeeritud) |
| Organisatsioonidiagramm | `@exports/org-chart.csv` |
| Moodulite nimekiri | `@modules/enabled.json` või register |
| Onboarding märkmed | `@docs/onboarding-checklist.md` |
| Agentide register | `/agents` või `@steward/agents/` |

## Samm 4 — Loodusliku keele mustrid

### Uurimine (ainult lugemine)

- «Võta kokku compliance vs finance agendi õigused.»
- «Selgita org eventi teed moodulist X audit logi.»

### Seadistus (mustand → inimene vaatab üle)

- «Mustand 20-inimese teenusettevõtte moodulite nimekiri JP jaoks — tabel.»
- «Selgita validate.sh väljundit rea kaupa» (pärast terminalis käivitamist)

### Operatsioonid (ettevaatlik — ainult kohalik)

- «Loetle skriptid, mis puudutavad tootmisandmeid; loe vs kirjuta.»

Väldi hävitavaid käske ilma inimese kinnituseta.

## Samm 5 — Agentide register

[Agentide register](/agents) kaardistab domeenid:

| Agent | Domeen | Tüüpilised küsimused |
|-------|--------|----------------------|
| executive | governance | Strateegia, kinnitused |
| secretary | governance | Ajakava, protokollid |
| finance | finance | Arved, pearaamat |
| contract | finance | Lepingute tsükkel |
| compliance | finance | Regulatiivsed kontrollid |
| operations | operations | Operatiivsed järjekorrad |

Sünkroniseeri kohalikud manifestid pärast registri uuendusi.

## Samm 6 — MCP ja terminal (valikuline)

- Eelista esmalt **ainult lugemise** MCP tööriistu
- Terminal: `docker compose ps`, `validate.sh`, logid — kleebi väljund vestlusse
- Ära avalda Org Console admin porte internetis

## Turvalisuse kontrollnimekiri

- [ ] Agent töötab **kohaliku** steward klooniga
- [ ] `.env` saladused — agent näeb ainult kohatäiteid
- [ ] Kirjutamised vaatab üle Steward Operator
- [ ] Validate läbib pärast agendi muudatusi

## Järgmised sammud

| Ressurss | Link |
|----------|------|
| Paigaldus ja kaksik | [Paigaldusjuhend](/content/orgos-install-setup) |
| OrgOS ülevaade | [Õppekeskus](/learning#about-orgos) |
| Õppekava | [Õpe → Õppekava](/learning#curriculum) |
| Moodulid | [Moodulite register](/modules#registry) |
