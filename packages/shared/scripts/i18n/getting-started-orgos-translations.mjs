/** Getting started — OrgOS hardware / software / install section + vision quote (no Linux analogy) */
export const GETTING_STARTED_ORGOS_TRANSLATIONS = {
  ja: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS は組織間の共通通信プロトコルとなることを目指します。",
    "Component": "構成要素",
    "Purpose": "用途",
    "Run OrgOS on your own hardware": "自社ハードウェアで OrgOS を動かす",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS の業務データは自社が管理するインフラ上に保持されます。以下は初回導入の推奨構成です — 詳細手順はセットアップガイドを参照してください。",
    "Recommended hardware": "推奨ハードウェア構成",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "本番は常時稼働のローカル機器で運用します。開発は Docker 付きノート PC から始め、同じ構成を Mac mini に移せます。",
    "Mac mini (or equivalent always-on host)": "Mac mini（または同等の常時稼働ホスト）",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — 社内 LAN 上の正本",
    "Synology NAS (optional)": "Synology NAS（任意）",
    "Backups and artifact storage": "バックアップと成果物保管",
    "Stable LAN": "安定した LAN",
    "Operators access Org Console on the local network": "社内ネットワークから Org Console にアクセス",
    "Outbound HTTPS": "アウトバウンド HTTPS",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub、モジュールレジストリ、任意の Control Plane ハートビート",
    "Software prerequisites": "必要なソフトウェア",
    "Install these on the host before cloning the steward repository.":
      "steward リポジトリを clone する前に、ホストに以下を用意してください。",
    "Docker and Docker Compose": "Docker と Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "OrgOS / Steward リポジトリへアクセスできる GitHub アカウント",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "OpenOrgOS Community アカウント（southwood.inc）— レジストリと学習リソース用",
    "How to install": "インストールの流れ",
    "Clone and configure":
      "clone と設定",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "steward リポジトリを clone し、.env.example を .env にコピー。TENANT_SLUG、法域、有効モジュール、DATABASE_URL、認証設定を編集します。",
    "Start the stack": "スタック起動",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "docker compose up -d を実行し、/health が通ることを確認してから次へ進みます。",
    "Initialize the tenant": "テナント初期化",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "tenant init と validate を実行。本番宣言前にエラーをすべて解消します。",
    "Baseline digital twin": "デジタルツインのベースライン",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "経営・財務ロールを割り当て、Console でテスト Org Event を確認し、有効モジュールを記録し、バックアップをテストします。",
    "Read the full OrgOS setup guide": "OrgOS セットアップガイド（全文）",
    "Information checklist, tenant init, and digital twin preparation.":
      "事前情報チェックリスト、tenant init、デジタルツイン準備の詳細。",
  },
  pt: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "O OpenOrgOS aspira ser o protocolo comum de comunicação entre organizações.",
    "Component": "Componente",
    "Purpose": "Finalidade",
    "Run OrgOS on your own hardware": "Execute o OrgOS no seu hardware",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "O OrgOS mantém dados de negócio na infraestrutura que você controla. Abaixo está a configuração recomendada — detalhes passo a passo estão no guia de configuração.",
    "Recommended hardware": "Hardware recomendado",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "A produção roda em hardware local sempre ligado. Desenvolva primeiro em um laptop com Docker e promova os mesmos padrões ao Mac mini.",
    "Mac mini (or equivalent always-on host)": "Mac mini (ou host equivalente sempre ligado)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — fonte da verdade na LAN",
    "Synology NAS (optional)": "Synology NAS (opcional)",
    "Backups and artifact storage": "Backups e armazenamento de artefatos",
    "Stable LAN": "LAN estável",
    "Operators access Org Console on the local network": "Acesso ao Org Console na rede local",
    "Outbound HTTPS": "HTTPS de saída",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, registro de módulos, heartbeat opcional do Control Plane",
    "Software prerequisites": "Pré-requisitos de software",
    "Install these on the host before cloning the steward repository.":
      "Instale no host antes de clonar o repositório steward.",
    "Docker and Docker Compose": "Docker e Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "Conta GitHub com acesso ao repositório OrgOS / Steward",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "Conta OpenOrgOS Community (southwood.inc) para registro e recursos de aprendizado",
    "How to install": "Como instalar",
    "Clone and configure": "Clonar e configurar",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Clone o repositório steward, copie .env.example para .env e defina TENANT_SLUG, jurisdição, módulos ativos, DATABASE_URL e autenticação.",
    "Start the stack": "Iniciar a stack",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "Execute docker compose up -d e confirme que /health passa antes de continuar.",
    "Initialize the tenant": "Inicializar o tenant",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "Execute tenant init e validate. Resolva todos os erros antes do go-live.",
    "Baseline digital twin": "Baseline do gêmeo digital",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Atribua papéis executivo e financeiro, confirme um org event de teste no Console, documente módulos ativos e teste backups.",
    "Read the full OrgOS setup guide": "Ler o guia completo de configuração do OrgOS",
    "Information checklist, tenant init, and digital twin preparation.":
      "Checklist de informações, tenant init e preparação do gêmeo digital.",
  },
  es: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS aspira a ser el protocolo común de comunicación entre organizaciones.",
    "Component": "Componente",
    "Purpose": "Propósito",
    "Run OrgOS on your own hardware": "Ejecute OrgOS en su hardware",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS mantiene los datos de negocio en la infraestructura que usted controla. Abajo está la configuración recomendada — los detalles paso a paso están en la guía de configuración.",
    "Recommended hardware": "Hardware recomendado",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "La producción corre en hardware local siempre encendido. Puede desarrollar primero en un portátil con Docker y promover los mismos patrones al Mac mini.",
    "Mac mini (or equivalent always-on host)": "Mac mini (u host equivalente siempre encendido)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — fuente de verdad en la LAN",
    "Synology NAS (optional)": "Synology NAS (opcional)",
    "Backups and artifact storage": "Copias de seguridad y almacenamiento de artefactos",
    "Stable LAN": "LAN estable",
    "Operators access Org Console on the local network": "Acceso a Org Console en la red local",
    "Outbound HTTPS": "HTTPS saliente",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, registro de módulos, heartbeat opcional del Control Plane",
    "Software prerequisites": "Requisitos de software",
    "Install these on the host before cloning the steward repository.":
      "Instálelos en el host antes de clonar el repositorio steward.",
    "Docker and Docker Compose": "Docker y Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "Cuenta GitHub con acceso al repositorio OrgOS / Steward",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "Cuenta OpenOrgOS Community (southwood.inc) para registro y recursos de aprendizaje",
    "How to install": "Cómo instalar",
    "Clone and configure": "Clonar y configurar",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Clone el repositorio steward, copie .env.example a .env y configure TENANT_SLUG, jurisdicción, módulos activos, DATABASE_URL y autenticación.",
    "Start the stack": "Iniciar la stack",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "Ejecute docker compose up -d y confirme que /health pasa antes de continuar.",
    "Initialize the tenant": "Inicializar el tenant",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "Ejecute tenant init y validate. Resuelva todos los errores antes del go-live.",
    "Baseline digital twin": "Baseline del gemelo digital",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Asigne roles ejecutivo y financiero, confirme un org event de prueba en Console, documente módulos activos y pruebe copias de seguridad.",
    "Read the full OrgOS setup guide": "Leer la guía completa de configuración de OrgOS",
    "Information checklist, tenant init, and digital twin preparation.":
      "Checklist de información, tenant init y preparación del gemelo digital.",
  },
  zh: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS 致力于成为组织间通信的通用协议。",
    "Component": "组件",
    "Purpose": "用途",
    "Run OrgOS on your own hardware": "在您自己的硬件上运行 OrgOS",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS 将业务数据保留在您控制的基础设施上。以下为推荐的首次部署配置 — 详细步骤见设置指南。",
    "Recommended hardware": "推荐硬件配置",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "生产环境使用常开本地硬件。可先在带 Docker 的笔记本上开发，再将相同模式迁移到 Mac mini。",
    "Mac mini (or equivalent always-on host)": "Mac mini（或等效常开主机）",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — 局域网内的权威数据源",
    "Synology NAS (optional)": "Synology NAS（可选）",
    "Backups and artifact storage": "备份与制品存储",
    "Stable LAN": "稳定局域网",
    "Operators access Org Console on the local network": "操作员通过本地网络访问 Org Console",
    "Outbound HTTPS": "出站 HTTPS",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub、模块注册表、可选 Control Plane 心跳",
    "Software prerequisites": "软件前置要求",
    "Install these on the host before cloning the steward repository.":
      "克隆 steward 仓库前，请在主机上安装以下软件。",
    "Docker and Docker Compose": "Docker 与 Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "可访问 OrgOS / Steward 仓库的 GitHub 账户",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "OpenOrgOS Community 账户（southwood.inc）— 用于注册表与学习资源",
    "How to install": "安装步骤",
    "Clone and configure": "克隆与配置",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "克隆 steward 仓库，将 .env.example 复制为 .env，设置 TENANT_SLUG、法域、启用模块、DATABASE_URL 与认证。",
    "Start the stack": "启动栈",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "运行 docker compose up -d，确认 /health 通过后再继续。",
    "Initialize the tenant": "初始化租户",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "运行 tenant init 与 validate。上线前解决所有错误。",
    "Baseline digital twin": "数字孪生基线",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "分配执行与财务角色，在 Console 确认测试 org event，记录启用模块并测试备份。",
    "Read the full OrgOS setup guide": "阅读完整 OrgOS 设置指南",
    "Information checklist, tenant init, and digital twin preparation.":
      "信息清单、tenant init 与数字孪生准备详情。",
  },
  et: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS püüab olla organisatsioonide ühine suhtlusprotokoll.",
    "Component": "Komponent",
    "Purpose": "Otstarve",
    "Run OrgOS on your own hardware": "Käivitage OrgOS oma riistvaral",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS hoiab äriandmeid teie kontrollitaval infrastrukuuril. Allpool on soovituslik esmane juurutus — samm-sammult juhend on seadistusjuhendis.",
    "Recommended hardware": "Soovituslik riistvara",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "Tootmine töötab alati-sees kohalikul riistvaral. Arendage esmalt sülearvutis Dockeriga, seejärel viige samad mustrid Mac minile.",
    "Mac mini (or equivalent always-on host)": "Mac mini (või võrdväärne alati-sees host)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — tõe allikas teie LAN-is",
    "Synology NAS (optional)": "Synology NAS (valikuline)",
    "Backups and artifact storage": "Varukoopiad ja artefaktide salvestus",
    "Stable LAN": "Stabiilne LAN",
    "Operators access Org Console on the local network": "Operaatorid pääsevad Org Console'ile kohalikus võrgus",
    "Outbound HTTPS": "Väljuv HTTPS",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, moodulite register, valikuline Control Plane heartbeat",
    "Software prerequisites": "Tarkvara eeltingimused",
    "Install these on the host before cloning the steward repository.":
      "Installige need hostile enne steward repohoidla kloonimist.",
    "Docker and Docker Compose": "Docker ja Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "GitHub konto OrgOS / Steward repole",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "OpenOrgOS Community konto (southwood.inc) registri ja õppematerjalide jaoks",
    "How to install": "Kuidas installida",
    "Clone and configure": "Klooni ja seadista",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Kloonige steward repo, kopeerige .env.example → .env, seadke TENANT_SLUG, jurisdiktsioon, moodulid, DATABASE_URL ja autentimine.",
    "Start the stack": "Käivita stack",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "Käivitage docker compose up -d ja veenduge, et /health läbib enne jätkamist.",
    "Initialize the tenant": "Initsialiseeri tenant",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "Käivitage tenant init ja validate. Lahendage kõik vead enne go-live'i.",
    "Baseline digital twin": "Digitaalse kaksiku baas",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Määrake juhtimis- ja finantsrollid, kinnitage test org event Console'is, dokumenteerige moodulid ja testige varukoopiat.",
    "Read the full OrgOS setup guide": "Lugege täielikku OrgOS seadistusjuhendit",
    "Information checklist, tenant init, and digital twin preparation.":
      "Teabe kontrollnimekiri, tenant init ja digitaalse kaksiku ettevalmistus.",
  },
  fr: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS vise à être le protocole commun de communication entre organisations.",
    "Component": "Composant",
    "Purpose": "Rôle",
    "Run OrgOS on your own hardware": "Exécuter OrgOS sur votre matériel",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS conserve les données métier sur l'infrastructure que vous contrôlez. Ci-dessous la configuration recommandée — les détails pas à pas sont dans le guide de configuration.",
    "Recommended hardware": "Matériel recommandé",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "La production tourne sur du matériel local toujours allumé. Développez d'abord sur un portable avec Docker, puis reportez les mêmes modèles sur Mac mini.",
    "Mac mini (or equivalent always-on host)": "Mac mini (ou hôte équivalent toujours allumé)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — source de vérité sur votre LAN",
    "Synology NAS (optional)": "Synology NAS (optionnel)",
    "Backups and artifact storage": "Sauvegardes et stockage d'artefacts",
    "Stable LAN": "LAN stable",
    "Operators access Org Console on the local network": "Accès à Org Console sur le réseau local",
    "Outbound HTTPS": "HTTPS sortant",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, registre de modules, heartbeat Control Plane optionnel",
    "Software prerequisites": "Prérequis logiciels",
    "Install these on the host before cloning the steward repository.":
      "Installez-les sur l'hôte avant de cloner le dépôt steward.",
    "Docker and Docker Compose": "Docker et Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "Compte GitHub avec accès au dépôt OrgOS / Steward",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "Compte OpenOrgOS Community (southwood.inc) pour registre et ressources d'apprentissage",
    "How to install": "Comment installer",
    "Clone and configure": "Cloner et configurer",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Clonez le dépôt steward, copiez .env.example vers .env et définissez TENANT_SLUG, juridiction, modules activés, DATABASE_URL et authentification.",
    "Start the stack": "Démarrer la stack",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "Exécutez docker compose up -d et confirmez que /health passe avant de continuer.",
    "Initialize the tenant": "Initialiser le tenant",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "Exécutez tenant init et validate. Résolvez toutes les erreurs avant le go-live.",
    "Baseline digital twin": "Baseline du jumeau numérique",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Assignez les rôles exécutif et finance, confirmez un org event de test dans Console, documentez les modules et testez les sauvegardes.",
    "Read the full OrgOS setup guide": "Lire le guide complet de configuration OrgOS",
    "Information checklist, tenant init, and digital twin preparation.":
      "Checklist d'informations, tenant init et préparation du jumeau numérique.",
  },
  de: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS strebt danach, das gemeinsame Kommunikationsprotokoll zwischen Organisationen zu werden.",
    "Component": "Komponente",
    "Purpose": "Zweck",
    "Run OrgOS on your own hardware": "OrgOS auf eigener Hardware betreiben",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS hält Geschäftsdaten auf Infrastruktur, die Sie kontrollieren. Unten die empfohlene Erstkonfiguration — Schritt-für-Schritt-Details im Einrichtungsleitfaden.",
    "Recommended hardware": "Empfohlene Hardware",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "Produktion läuft auf immer eingeschalteter lokaler Hardware. Entwickeln Sie zuerst auf einem Laptop mit Docker und übertragen Sie dieselben Muster auf den Mac mini.",
    "Mac mini (or equivalent always-on host)": "Mac mini (oder gleichwertiger Dauerbetriebs-Host)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — System of Record in Ihrem LAN",
    "Synology NAS (optional)": "Synology NAS (optional)",
    "Backups and artifact storage": "Backups und Artefaktspeicher",
    "Stable LAN": "Stabiles LAN",
    "Operators access Org Console on the local network": "Org Console im lokalen Netzwerk",
    "Outbound HTTPS": "Ausgehendes HTTPS",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, Modulregister, optionaler Control-Plane-Heartbeat",
    "Software prerequisites": "Software-Voraussetzungen",
    "Install these on the host before cloning the steward repository.":
      "Vor dem Klonen des Steward-Repositories auf dem Host installieren.",
    "Docker and Docker Compose": "Docker und Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "GitHub-Konto mit Zugriff auf OrgOS-/Steward-Repository",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "OpenOrgOS-Community-Konto (southwood.inc) für Register und Lernressourcen",
    "How to install": "Installation",
    "Clone and configure": "Klonen und konfigurieren",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Steward-Repo klonen, .env.example nach .env kopieren, TENANT_SLUG, Jurisdiktion, Module, DATABASE_URL und Auth setzen.",
    "Start the stack": "Stack starten",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "docker compose up -d ausführen und /health bestätigen, bevor Sie fortfahren.",
    "Initialize the tenant": "Tenant initialisieren",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "tenant init und validate ausführen. Alle Fehler vor Go-live beheben.",
    "Baseline digital twin": "Baseline digitaler Zwilling",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Führungs- und Finanzrollen zuweisen, Test-Org-Event in Console, Module dokumentieren, Backup testen.",
    "Read the full OrgOS setup guide": "Vollständigen OrgOS-Einrichtungsleitfaden lesen",
    "Information checklist, tenant init, and digital twin preparation.":
      "Informations-Checkliste, tenant init und Vorbereitung des digitalen Zwillings.",
  },
  ru: {
    "OpenOrgOS aims to be the common protocol for organizations to communicate across boundaries.":
      "OpenOrgOS стремится стать общим протоколом коммуникации между организациями.",
    "Component": "Компонент",
    "Purpose": "Назначение",
    "Run OrgOS on your own hardware": "Запуск OrgOS на своём оборудовании",
    "OrgOS keeps business data on infrastructure you control. Below is the recommended first deployment — step-by-step details are in the setup guide.":
      "OrgOS хранит бизнес-данные на инфраструктуре под вашим контролем. Ниже рекомендуемая конфигурация — подробные шаги в руководстве по настройке.",
    "Recommended hardware": "Рекомендуемое оборудование",
    "Production runs on always-on local hardware. You can develop on a laptop with Docker first, then promote the same patterns to your Mac mini.":
      "Продакшен работает на локальном оборудовании, которое всегда включено. Сначала можно разрабатывать на ноутбуке с Docker, затем перенести те же шаблоны на Mac mini.",
    "Mac mini (or equivalent always-on host)": "Mac mini (или аналогичный всегда включённый хост)",
    "Org Runtime + Org Console — system of record on your LAN": "Org Runtime + Org Console — источник истины в вашей LAN",
    "Synology NAS (optional)": "Synology NAS (опционально)",
    "Backups and artifact storage": "Резервные копии и хранение артефактов",
    "Stable LAN": "Стабильная LAN",
    "Operators access Org Console on the local network": "Доступ к Org Console в локальной сети",
    "Outbound HTTPS": "Исходящий HTTPS",
    "GitHub, module registry, optional Control Plane heartbeat":
      "GitHub, реестр модулей, опциональный heartbeat Control Plane",
    "Software prerequisites": "Программные требования",
    "Install these on the host before cloning the steward repository.":
      "Установите на хосте перед клонированием репозитория steward.",
    "Docker and Docker Compose": "Docker и Docker Compose",
    "Git": "Git",
    "GitHub account with access to your OrgOS / Steward repository":
      "Аккаунт GitHub с доступом к репозиторию OrgOS / Steward",
    "OpenOrgOS Community account (southwood.inc) for registry and learning resources":
      "Аккаунт OpenOrgOS Community (southwood.inc) для реестра и обучающих материалов",
    "How to install": "Как установить",
    "Clone and configure": "Клонирование и настройка",
    "Clone the steward repository, copy .env.example to .env, and set TENANT_SLUG, jurisdiction, enabled modules, DATABASE_URL, and auth settings.":
      "Клонируйте репозиторий steward, скопируйте .env.example в .env, задайте TENANT_SLUG, юрисдикцию, модули, DATABASE_URL и аутентификацию.",
    "Start the stack": "Запуск стека",
    "Run docker compose up -d and confirm the /health check passes before continuing.":
      "Выполните docker compose up -d и убедитесь, что /health проходит, прежде чем продолжить.",
    "Initialize the tenant": "Инициализация tenant",
    "Run tenant init and validate scripts. Resolve all errors before go-live.":
      "Запустите tenant init и validate. Устраните все ошибки до go-live.",
    "Baseline digital twin": "Базовая линия цифрового двойника",
    "Assign executive and finance roles, confirm a test org event in Console, document enabled modules, and test backups.":
      "Назначьте роли executive и finance, подтвердите тестовый org event в Console, задокументируйте модули и проверьте резервное копирование.",
    "Read the full OrgOS setup guide": "Полное руководство по настройке OrgOS",
    "Information checklist, tenant init, and digital twin preparation.":
      "Чеклист информации, tenant init и подготовка цифрового двойника.",
  },
};
