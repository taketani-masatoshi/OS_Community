---
title: Статус реализации OpenOrgOS
description: Глобальный протокол, Wire, сайт Community, Commercial Hub и национальные шлюзы вроде X-Road — что работает сегодня
---

> **Аудитория:** Stewards, члены комитетов, интеграторы и партнёры, оценивающие OpenOrgOS.  
> **Обновлено:** 2026-07 — Community в Phase 0; Hub и адаптеры национальных шлюзов по юрисдикциям.  
> **Канонический источник протокола:** репозиторий OrgOS — при расхождении этой страницы и repo **преобладает repo**.

## Кратко

OpenOrgOS состоит из **трёх разделяемых слоёв**. Не путайте прогресс одного слоя с готовностью другого.

| Слой | Что это | Статус |
|------|---------|--------|
| **Глобальный протокол** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Определён** — словарь и архитектура в repo OrgOS |
| **Wire · Witness** | Межорганизационный транспорт и проверяемые доказательства | **Специфицирован** — эталонная реализация в OrgOS; не продукт Community |
| **Runtime OrgOS** | On-premises steward stack (Core, Modules, Agents, CLI) | **Доступен** — устанавливается; модули зависят от домена |
| **OpenOrgOS Community** (этот сайт) | OSS-реестр, комитеты, governance, обучение | **Работает** — Phase 0 |
| **Commercial Hub** | Marketplace платных модулей по юрисдикции | **Phase 0→1** — продажи ещё нет |
| **Национальные шлюзы** (класс X-Road) | Адаптеры к защищённым сетям обмена | **Запланировано** — адаптер не поставлен; модули юрисдикции задают mapping |

**Вы здесь:** Community и реестр WILD работают. Продажи Hub и адаптеры класса X-Road — **работа по дизайну и cohort**, не live-интеграции на этом сайте.

---

## Слой глобального протокола

**Глобальный слой остаётся тонким**. Он определяет, *как* организации обмениваются состоянием через границы — не локальные бизнес-правила.

| Возможность | Определение | Runtime |
|-------------|-------------|---------|
| **Org Event Model** | В mission и словаре OrgOS | События в OrgOS; **межорг relay — P2** (см. Wire) |
| **Identity Exchange** | Определён | Сегодня идентичность в tenant; федеративный обмен **планируется с Wire** |
| **Authority Delegation** | В модулях и границах agent | Работает в tenant; межорг делегирование **через Wire** |
| **Auditability** | Определён (Witness, timelines) | Работает в tenant |

Терминология (Module vs Agent vs Wire): [Module and Agent](/content/module-and-agent).

---

## Wire и Witness

**Wire** — **не** Module, Agent или продукт Hub. Это **транспорт протокола** для org-to-org сообщений и событий. **Witness** — проверяемые доказательства для третьих сторон.

### Место Wire в OrgOS

| # | Компонент | Роль |
|---|-----------|------|
| 1 | **OpenOrgOS Core** | Движок правил, config tenant, CLI |
| 2 | **Module linkage** | Доменные паки (учёт, медизделия, …) |
| 3 | **Wire · Witness** | Трансграничный обмен и audit evidence |
| — | **Agents** | Ограниченные LLM-операторы *внутри* tenant |

Частая поправка: **«Agent отправляет Wire»** — неверно. Wire на уровне протокола; agents **готовят черновики**; люди **утверждают**; **CLI / Skill** выполняет детерминированно.

### Статус реализации

| Пункт | Статус |
|-------|--------|
| Словарь и архитектура (`orgos-vocabulary.md` и др.) | **Опубликовано** в repo OrgOS |
| Операции в tenant (Skills, CLI, agents, modules) | **Доступно** на установленном OrgOS |
| **Org Event relay** (межорг gateway) | **P2 запланирован** — backlog Control Plane; не live на Community |
| Публичный Wire endpoint на `community.oorgos.org` | **Не предлагается** — Community = реестр/governance, не Wire hub |

Relay **не заменит** юрисдикционные шлюзы; он несёт **события OpenOrgOS** между участвующими org.

---

## Commercial Hub

**Hub** — **Commercial канал**: лицензированные операторы продают и поддерживают модули **по правовому домену**. Отдельно от review Community.

| Пункт | Статус |
|-------|--------|
| Реестр WILD + Community на этом сайте | **Работает** — [/modules](/modules) |
| Комитеты и governance | **Работает** — [/committees](/committees), [/governance](/governance) |
| Pipeline Candidate + Program Fund | **Подготовка Phase 1** — cohort и Assess определены, не полностью автоматизированы |
| Marketplace Commercial Hub | **Не работает** — первый cohort юрисдикции в процессе |
| Продукты Agent в Hub | **Пока вне scope** — сначала modules |

Фазы (детали): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ готовность к Commercial.** Listing Commercial требует **пути Hub**, не только promotion в реестре.

---

## X-Road и национальные шлюзы обмена

### Что такое X-Road

**[X-Road](https://x-road.global/)** — **национальный (или региональный) слой безопасного обмена данными**: члены подключаются через security servers; доступ по политике и контракту (Эстония, Финляндия, другие члены NIIS).

X-Road отвечает: *«Как моя организация подключается к доверенной exchange fabric **страны**?»*

### Связь с OpenOrgOS

| | **OpenOrgOS Wire** | **Шлюз класса X-Road** |
|---|-------------------|------------------------|
| Область | **Org-to-org** обмен событиями и состоянием в форме OpenOrgOS | Членство в **национальной инфраструктуре** и технический gateway |
| Владелец | Участвующие org + spec протокола | Оператор страны/региона (напр. члены NIIS) |
| Содержание | Org events, delegation, audit envelopes | Сообщения членов и национальные schemas |
| Роль OpenOrgOS | **Семантическая модель** и steward runtime | **Не заменяет** X-Road — **interop** где требуют комитеты |

OpenOrgOS **сегодня не поставляет production X-Road adapter**. Трансграничные/госсектор сценарии объединяют:

1. **Runtime OrgOS** (локальный source of truth),
2. **Wire** (org-to-org события OpenOrgOS, когда relay доступен),
3. **Модуль юрисдикции + gateway adapter** (mapping сообщений gateway ↔ Org Event Model).

### Статус и следующие шаги

| Пункт | Статус |
|-------|--------|
| Модуль X-Road adapter в реестре Community | **Пока нет** |
| Эталонный adapter в repo OrgOS | **Не поставлен** |
| Charter комитета госсектор / gateway interop | **Приглашаем** — domain и jurisdiction committees |
| Путь OOO RFC для профилей gateway | **Доступен** — standards через OOO Program |

В среде члена X-Road **предложите модуль юрисдикции** или вступите в соответствующий [комитет](/committees) — mapping gateway это **локальные правила**, не глобальный протокол.

---

## Сайт OpenOrgOS Community (этот сайт)

Что `community.oorgos.org` реализует сегодня:

| Возможность | Статус |
|-------------|--------|
| Реестр модулей (WILD, lifecycle) | **Работает** |
| Предложения wild module | **Работает** |
| Комитеты и domain governance | **Работает** |
| Сертификации и запросы role | **Работает** |
| Identity (Google; GitHub / LinkedIn connect) | **Работает** |
| Учебные guides и docs (`/content/*`) | **Работает** |
| Треки Academy | **Частично** — зависит от конфигурации Academy |
| Commercial Hub / платежи | **Не на этом сайте** |
| Wire / Org Event ingress | **Не на этом сайте** |

Инфраструктура: обзор на [oorgos.org](https://oorgos.org); Community на steward deployment + Cloudflare Tunnel (runbooks в repo `docs/`).

---

## Runtime OrgOS (on-premises)

Для stewards, устанавливающих OrgOS на своё оборудование:

| Пункт | Статус |
|-------|--------|
| Гайд install и digital twin | **Опубликован** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Доступны** в reference stack |
| Доменные modules (rental, jp_medical_device, …) | **По-разному** — [/modules](/modules) |
| Control Plane heartbeat / outbound agent | **Архитектура определена** — `docs/plans/` |
| Org Event relay к другим org | **P2 — не GA** |

---

## Краткий roadmap

| Фаза | Фокус | Представительные deliverables |
|------|-------|------------------------------|
| **Сейчас (Phase 0)** | Community OSS, реестр, комитеты | Этот сайт, WILD, governance |
| **Phase 0→1** | Первый Hub cohort | Ручной Commercial path в одной юрисдикции |
| **Phase 1–2** | Candidate + Assess + Program Fund | Платный audit prep pipeline |
| **Протокол P2** | Org Event relay (Wire gateway) | Транспорт межорг событий |
| **По юрисдикции** | X-Road / национальные gateway adapters | Mapping module + committee |

---

## Связанные ссылки

| Ресурс | Ссылка |
|--------|--------|
| Module ecosystem (фазы Hub) | [/content/module-ecosystem](/content/module-ecosystem) |
| Терминология Module / Agent / Wire | [/content/module-and-agent](/content/module-and-agent) |
| Mission и глобальный протокол | [/content/mission](/content/mission) |
| Реестр модулей | [/modules](/modules) |
| Governance | [/governance](/governance) |
| Гайд install OrgOS | [/content/orgos-install-setup](/content/orgos-install-setup) |
| Все docs | [/content](/content) |
