---
title: OpenOrgOSi rakendusseis
description: Ülemaailmne protokoll, Wire, Community sait, Commercial Hub ja riiklikud lüngad nagu X-Road — mis on täna live
---

> **Sihtrühm:** Stewards, komitee liikmed, integraatorid ja OpenOrgOSi hindavad partnerid.  
> **Uuendatud:** 2026-07 — Community Phase 0; Hub ja riiklike lüngad adapterid jurisdiktsioonide kaupa.  
> **Protokolli kanooniline allikas:** OrgOS reference repo — kui see leht ja repo erinevad, **repo kehtib**.

## Ülevaade

OpenOrgOS koosneb **kolmest eraldiseisvast kihist**. Ärge võtke ühe kihi edenemist teise valmimise märgina.

| Kiht | Mis see on | Olek |
|------|------------|------|
| **Ülemaailmne protokoll** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Defineeritud** — sõnavara ja arhitektuur OrgOS repos |
| **Wire · Witness** | Organisatsioonidevaheline transport ja kontrollitav tõend | **Spetsifitseeritud** — viitereferents OrgOSis; mitte Community toode |
| **OrgOS runtime** | Kohapealne steward stack (Core, Modules, Agents, CLI) | **Saadaval** — paigaldatav; moodulid sõltuvad valdkonnast |
| **OpenOrgOS Community** (see sait) | OSS register, komiteed, juhtimine, õpe | **Live** — Phase 0 |
| **Commercial Hub** | Jurisdiktsiooni tasuliste moodulite marketplace | **Phase 0→1** — müük veel puudub |
| **Riiklikud lüngad** (X-Road klass) | Adapterid riigi/piirkonna turvalisele vahetusvõrgule | **Plaanitud** — adapterit pole tarnitud; jurisdiktsiooni moodulid defineerivad kaardistuse |

**Olete siin:** Community ja WILD register töötavad. Hub müük ja X-Road klassi adapterid on **disaini- ja cohortitöö**, mitte live integratsioonid sellel saidil.

---

## Ülemaailmne protokolikiht

**Ülemaailmne kiht jääb õhukeseks**. See defineerib, *kuidas* organisatsioonid piiride ületamiseks olekut vahetavad — mitte kohalikke ärireegleid.

| Võimekus | Definitsioon | Runtime |
|----------|--------------|---------|
| **Org Event Model** | Dokumenteeritud missioonis ja OrgOS sõnavaras | Sündmused OrgOSis; **organisatsioonidevaheline relay on P2** (vt Wire) |
| **Identity Exchange** | Defineeritud | Täna tenant-kohalik identiteet; föderatiivne vahetus **planeeritud Wire'iga** |
| **Authority Delegation** | Moodulites ja agentide piirides | Töötav tenantis; organisatsioonidevaheline delegeerimine **Wire teel** |
| **Auditability** | Defineeritud (Witness, ajajooned) | Töötav tenantis |

Terminoloogia (Module vs Agent vs Wire): [Module and Agent](/content/module-and-agent).

---

## Wire ja Witness

**Wire** **ei ole** Module, Agent ega Hub toode. See on org-to-org sõnumite ja sündmuste **protokolli transport**. **Witness** hõlmab kolmandate poolte auditeeritavat tõendit.

### Wire OrgOSis

| # | Komponent | Roll |
|---|-----------|------|
| 1 | **OpenOrgOS Core** | Reeglimootor, tenant config, CLI |
| 2 | **Module linkage** | Valdkonnapakid (raamatupidamine, medseadmed, …) |
| 3 | **Wire · Witness** | Piirideülene vahetus ja auditi tõend |
| — | **Agents** | Piiratud LLM operaatorid *tenantis* |

Levinud parandus: **«Agent saadab Wire'i»** on vale. Wire on protokolli tasemel; agendid **koostavad**; inimesed **kinnitavad**; **CLI / Skill** täidab deterministlikult.

### Rakendusseis

| Kirje | Olek |
|-------|------|
| Sõnavara ja arhitektuur (`orgos-vocabulary.md` jne) | **Avaldatud** OrgOS repos |
| Tenant-sisesed operatsioonid (Skills, CLI, agents, modules) | **Kasutatav** paigaldatud OrgOSil |
| **Org Event relay** (organisatsioonidevaheline gateway) | **P2 plaanitud** — Control Plane backlog; Communitys mitte live |
| Avalik Wire endpoint `community.oorgos.org`-il | **Pole pakutud** — Community on register/juhtimine, mitte Wire hub |

Relay ei **asenda** jurisdiktsioonispetsiifilisi lüngaid; see kannab **OpenOrgOS-kujulisi sündmusi** osalevate orgide vahel.

---

## Commercial Hub

**Hub** on **Commercial kanal** — litsentseeritud operaatorid müüvad ja toetavad mooduleid **jurisdiktsiooni kaupa**. Eraldi Community reviewst.

| Kirje | Olek |
|-------|------|
| WILD + Community register sellel saidil | **Live** — [/modules](/modules) |
| Komiteed ja juhtimine | **Live** — [/committees](/committees), [/governance](/governance) |
| Candidate pipeline + Program Fund | **Phase 1 ettevalmistus** — cohort ja Assess defineeritud, mitte täielikult automatiseeritud |
| Commercial Hub marketplace | **Mitte live** — esimene jurisdiktsiooni cohort pooleli |
| Agent tooted Hubis | **Praegu väljaspool ulatust** — moodulid esmalt |

Faseid (detail): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ Commercial-valmis.** Commercial loetelu nõuab **Hub teed**, mitte ainult register edutamist.

---

## X-Road ja riiklikud vahetuslüngad

### Mis on X-Road

**[X-Road](https://x-road.global/)** on **riiklik (või piirkondlik) turvalise andmevahetuse kiht** — liikorganisatsioonid ühenduvad security serverite kaudu; juurdepääs poliitika ja lepingu alusel (Eesti, Soome, teised NIIS liikmed).

X-Road vastab: *«Kuidas ühendada minu organisatsioon **riigi** usaldusväärse vahetusvõrguga?»*

### Seos OpenOrgOSiga

| | **OpenOrgOS Wire** | **X-Road klassi gateway** |
|---|-------------------|---------------------------|
| Ulatus | Org-to-org **sündmuste ja oleku vahetus** OpenOrgOS kujul | **Riikliku infrastruktuuri** liikmesus ja tehniline gateway |
| Omanik | Osalevad orgid + protokolli spec | Riigi/piirkonna operaator (nt NIIS liikmed) |
| Sisu | Org sündmused, delegeerimine, auditi ümbrised | Liikmespetsiifilised sõnumid ja riiklikud skeemid |
| OpenOrgOS roll | **Semantiline mudel** ja steward runtime | **Ei asenda** X-Roadi — **interop** kus komiteed nõuavad |

OpenOrgOS **ei tarni täna tootmis-X-Road adapterit**. Piiriülesed/avaliku sektori stsenaariumid kombineerivad:

1. **OrgOS runtime** (kohalik tõde),
2. **Wire** (OpenOrgOS org-to-org sündmused, kui relay saadaval),
3. **Jurisdiktsiooni moodul + gateway adapter** (riikliku gateway sõnumid ↔ Org Event Model).

### Olek ja järgmised sammud

| Kirje | Olek |
|-------|------|
| X-Road adapter moodul Community registris | **Pole veel loetletud** |
| Viiteadapter OrgOS repos | **Pole tarnitud** |
| Avaliku sektori / gateway interop komitee charter | **Kutsutud** — valdkonna ja jurisdiktsiooni komiteed |
| OOO RFC tee gateway profiilidele | **Saadaval** — standardid OOO Programi kaudu |

X-Road liikmeskeskkonnas vajate OpenOrgOS interopit — **esitage jurisdiktsiooni moodul** või liituge asjakohase [komitee](/committees)ga — gateway kaardistus on **kohalikud reeglid**, mitte ülemaailmne protokoll.

---

## OpenOrgOS Community sait (see veebisait)

Mida `community.oorgos.org` täna implementeerib:

| Võimekus | Olek |
|----------|------|
| Mooduliregister (WILD, lifecycle) | **Live** |
| Wild mooduli ettepanekud | **Live** |
| Komiteed ja valdkonna juhtimine | **Live** |
| Sertifitseerimine ja rollitaotlused | **Live** |
| Identity (Google; GitHub / LinkedIn connect) | **Live** |
| Õpijuhendid ja dokid (`/content/*`) | **Live** |
| Academy rajad | **Osaliselt** — sõltub Academy konfiguratsioonist |
| Commercial Hub / maksed | **Mitte sellel saidil** |
| Wire / Org Event ingress | **Mitte sellel saidil** |

Infrastruktuur: ülevaade [oorgos.org](https://oorgos.org); Community steward deployment + Cloudflare Tunnel (runbookid repos `docs/`).

---

## OrgOS runtime (kohapeal)

Stewardidele, kes installivad OrgOSi oma riistvarale:

| Kirje | Olek |
|-------|------|
| Paigaldus- ja digital twin juhend | **Avaldatud** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Saadaval** viitestackis |
| Valdkonna moodulid (rental, jp_medical_device, …) | **Erineb** — [/modules](/modules) |
| Control Plane heartbeat / outbound agent | **Arhitektuur defineeritud** — `docs/plans/` |
| Org Event relay teistele orgidele | **P2 — mitte GA** |

---

## Teekaardi kokkuvõte

| Faas | Fookus | Esinduslikud tulemused |
|------|--------|------------------------|
| **Praegu (Phase 0)** | Community OSS, register, komiteed | See sait, WILD, juhtimine |
| **Phase 0→1** | Esimene Hub cohort | Käsitsi Commercial tee ühes jurisdiktsioonis |
| **Phase 1–2** | Candidate + Assess + Program Fund | Tasuline auditi ettevalmistuse pipeline |
| **Protokoll P2** | Org Event relay (Wire gateway) | Organisatsioonidevaheline sündmuste transport |
| **Jurisdiktsiooni kaupa** | X-Road / riiklikud gateway adapterid | Moodul + komitee defineeritud kaardistus |

---

## Seotud lingid

| Ressurss | Link |
|----------|------|
| Module ecosystem (Hub faasid) | [/content/module-ecosystem](/content/module-ecosystem) |
| Module / Agent / Wire terminoloogia | [/content/module-and-agent](/content/module-and-agent) |
| Missioon ja ülemaailmne protokoll | [/content/mission](/content/mission) |
| Mooduliregister | [/modules](/modules) |
| Juhtimine | [/governance](/governance) |
| OrgOS paigaldusjuhend | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Kõik dokid | [/content](/content) |
