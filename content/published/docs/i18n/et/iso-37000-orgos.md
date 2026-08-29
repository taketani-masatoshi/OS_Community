---
title: OrgOS ja ISO 37000
description: Kuidas OrgOS-i initsialiseerimine toetab ISO 37000-ga kooskõlalise juhtimise enesedeklaratsiooni.
---

# OrgOS ja ISO 37000

**OrgOS** ühendab juurutamise ja juhtimise: **initsialiseerimisel** saavad eesmärk, rollid, järelevalve ja jälgitavus üheks baasiks.

See baas toetab usaldusväärset **enesedeklaratsiooni** vastavusest **ISO 37000** juhisele (*Governance of organizations*). OpenOrgOS Community ei väljasta kolmandate osapoolte ISO-sertifikaate.

## Mida kogukond pakub

OpenOrgOS Community on **neutraalne kodu** protokollile, moodulitele, õppele ja operaatoritele. Juhtimisväited jäävad iga organisatsiooni vastutuseks.

| Mõiste | Määratlus |
|--------|--------|
| **OrgOS** | Organisatsiooni runtime teie hallataval taristul |
| **OOO** | [OpenOrgOS Operator](/certifications) — juurutamise referentsroll |
| **ISO 37000** | Rahvusvaheline juhis organisatsioonide juhtimiseks |
| **Enesedeklaratsioon** | Organisatsiooni enda avaldus — mitte akrediteeritud sertifikaat |

ISO 37000 on **juhis**, mitte sertifitseeritav nõudestandard nagu ISO 9001. OrgOS muudab hindamise **töötavaks ja tõenduspõhiseks**.

## Järjekord

1. **Juuruta** — OrgOS omal riistvaral ([paigaldusjuhend](/content/orgos-install-setup))
2. **Valmista** — juriidiline identiteet, struktuur, jurisdiktsioonid, moodulid
3. **Initsialiseeri** — `orgos tenant init` kirjutab eesmärgi visandi ja ISO 37000 mustandi
4. **Hinda** — `orgos governance principles status`. Kohatäite-mission ei ole ready
5. **Deklareeri** — ainult inimene: `orgos governance principles declare --signatory "…"`

Teed juhib tavaliselt **OpenOrgOS Operator (OOO)**.

## Teemad (näitlikud)

| ISO 37000 põhimõte | Mida OrgOS aitab kehtestada |
|---------------------|-----------------------------|
| **Purpose** | Missioon, visioon ja väärtused äriplaanis |
| **Value and strategy** | Plaanid, KPI-d, eelarveväravad |
| **Oversight** | Ettevõttesündmused, protokollid, Operator Console |
| **Accountability** | Nimetatud operaatorid, RBAC, eneseheakskiidu keeld |
| **Stakeholders** | Nõustajad, juhtimisregister, IR / Wire |
| **Leadership** | Inimese lõplik heakskiit, sisselogimisdomeen, PassKey |
| **Data and decisions** | YAML allikana, analytics, juhtimislaud |
| **Risk** | Riskiregister; ISMS, kui ISO 27001 on sees |
| **Social responsibility** | ESG / keskkonnanormid, kui kohalduvad |
| **Viability** | Mitmeaastased plaanid, võlaplaan, tenanti elutsükkel |

## «Enesedeklaratsiooni valmisoleku» ulatus

**Sees:** töötav struktuur ja otsustusjälg; tee eesmärk → struktuur → järelevalve; `orgos governance principles status`.

**Väljas:** automaatne ISO-sertifitseerimine; õigusnõu; ISO 37001 (korruptsioonivastane) või ISO 37301 (CMS) — eraldi pakid.

## Järgmised sammud

| Tegevus | Allikas |
|---------|---------|
| Mõista OrgOS-i | [Learning](/learning#about-orgos) |
| Juuruta | [OrgOS Install](/content/orgos-install-setup) |
| Operaator | [Certifications](/certifications) |
| Kogukonna juhtimine | [Governance](/governance) |
