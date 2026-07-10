---
title: OrgOS paigaldus ja digitaalse kaksiku ettevalmistus
description: Paigaldage OrgOS nullist, koguge organisatsiooni teave ja valmistage digitaalse kaksiku keskkond ette.
---

> **Ülevaade:** [Mis on OrgOS?](/learning#about-orgos) õppekeskuses — deterministlik tarkvara, loodusliku keelega AI kasutamine ja moodulite laiendamine.

See juhend juhendab **Steward Operatorit** esimesel juurutamisel: eeltingimused, teave enne `tenant init` ja **digitaalse kaksiku** baas (organisatsioonidiagramm, moodulid, audit).

OrgOS **äriandmed jäävad teie infrastruktuuri**. OpenOrgOS Community (`openorgos.net`) pakub protokolli, moodulite registrit ja õppematerjale — mitte tenant andmeid.

## Sihtgrupp

| Roll | Eesmärk |
|------|---------|
| **Steward Operator** | Org Console ettevõtte riistvaral minimaalse IT-ta |
| **Asutaja / sponsor** | Mõista, mida enne go-live'i valmistada |
| **Steward (konsultant)** | Kliendi keskkonna valideerimine enne üleandmist |

## Tulemused

1. Toetatud masin Docker-põhise OrgOS jaoks
2. Organisatsiooni faktide kontrollnimekiri (struktuur, jurisdiktsioonid, moodulid)
3. Initsialiseeritud tenant valideeritud seadistusega
4. Digitaalse kaksiku minimaalne ulatus: organisatsioonidiagramm, aktiivsed moodulid, audit

## Faas 0 — Esmalt kogutav teave

Enne `tenant init`:

### Organisatsiooni identiteet

- Juriidiline nimi, kaubamärgid, peamised jurisdiktsioonid
- Majandusaasta ja aruandlusvaluuta
- Igapäevane **Steward Operator** kontakt

### Struktuur (kaksiku seeme)

- Osakonnad / meeskonnad ja aruandlusliinid
- Võtmerollid — vastenda [Steward agentidega](/agents)
- Välised osapooled org eventide vahetuseks

### Moodulite kavatsus

Sirvi [moodulite registrit](/modules#registry):

| Valdkond | Näited | Käivitus? |
|----------|--------|-----------|
| Juhtimine | ettepanekud, komiteed | Sageli jah |
| Finants | arveldus, lepingud | Vajadusel |
| Operatsioonid | laoseis, graafikud | Vajadusel |

### Andmepiirid

- Mis **ei tohi** Mac minilt lahkuda (PII, lepingud, pearaamat)
- Mis võib minna valikulisse SaaS-i (ainult lugemine)

## Faas 1 — Riistvara ja võrk

| Komponent | Otstarve |
|-----------|----------|
| **Mac mini** (või alati-sees host) | Org Runtime + Org Console — **tõe allikas** |
| **Synology NAS** (valikuline) | Varukoopiad |
| Stabiilne LAN | Org Console sisevõrgus |
| Väljuv HTTPS | GitHub, register, valikuline heartbeat |

## Faas 2 — Tarkvara eeltingimused

```bash
docker --version
docker compose version
git --version
```

- **GitHub** konto OrgOS / Steward repole
- OpenOrgOS Community konto [openorgos.net](/login)
- `.env` ainult hostil — ära commiteeri salajasi andmeid

## Faas 3 — Kloonimine ja seadistus

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Muuda: TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

Paranda health check enne jätkamist.

## Faas 4 — `tenant init` ja validate

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Järgi steward repo README-d. Lahenda kõik vead enne go-live'i.

## Faas 5 — Digitaalse kaksiku baas

| Kiht | Seadistus |
|------|-----------|
| **Identity** | Inimesed, rollid, kontod |
| **Authority** | Delegeerimised, komitee ulatus |
| **Events** | Moodulite org eventid |
| **Agents** | [Agentide register](/agents) |

- [ ] Juhtimis- ja finantsrollid määratud
- [ ] Vähemalt üks test org event Console'is
- [ ] Aktiivsed moodulid runbook'is
- [ ] Varukoopia testitud (DB + config)

## Faas 6 — Järgmised sammud

| Järgmine | Link |
|----------|------|
| AI (Cursor) | [OrgOS AI agentidega](/content/orgos-ai-agents) |
| OrgOS ülevaade | [Õppekeskus](/learning#about-orgos) |
| Õppekava | [Õpe → Õppekava](/learning#curriculum) |

## Tõrkeotsing

| Sümptom | Tõenäoline põhjus |
|---------|-------------------|
| OAuth ebaõnnestub | Brauseri URL ≠ `.env` `AUTH_URL` |
| DB ühendus | Vale `DATABASE_URL` host Dockeris |
| Moodul ei lae | Pole registris või tenant init OFF |

## Seotud lugemine

- [OpenOrgOS missioon](/content/mission)
- [Stewardship mudel](/content/stewardship-model)
- [Agentide register](/agents)
