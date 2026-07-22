---
title: 设计思想
description: AIA 优先开发、语言无关的协议、全球/本地分层
---

> **对象:** Steward、贡献者、集成商与合作伙伴  
> **相关:** [Language Policy](/content/language-policy) · [Module and Agent](/content/module-and-agent) · [OrgOS with AI Agents](/content/orgos-ai-agents)

## 概要

OpenOrgOS 是组织间通信的 **精简全球协议** — 并非内部 HR 或薪酬 OS。项目积极使用 **AIA**（AI Agent 助理）构建与运营，但 AIA 并非必需。规则以 **Markdown 与 YAML** 编写；参考 **Steward CLI 目前为 TypeScript**，也可用 **Python、C、Rust、Go** 等实现相同契约。互操作性来自共享事件模型与审计规则，而非强制单一运行时。

---

## 核心座右铭

```
Design globally.     Implement locally.
Govern universally.  Comply locally.

One protocol.        Many implementations.
Global principles.   Local autonomy.
```

| 原则 | 含义 |
|------|------|
| **Design globally** | Org Event Model、identity exchange、authority delegation、auditability — 一次定义 |
| **Implement locally** | 法律、税务、劳动、行业规则 — 各国社区模块 |
| **Govern universally** | RFC、API 与跨境协作使用英语 |
| **Comply locally** | 各国委员会拥有法律解释与本地工作流 |

详见 [Language Policy](/content/language-policy)。

---

## 精简的全球层

全球层仅定义 **交换机制**：

- 组织如何记录事件
- 跨边界交换身份
- 权限委派与范围
- 第三方可验证的审计时间线

**业务逻辑、法律解释与组织行为委派给各国或领域委员会。** 模块实现本地含义；全球层不集中管理各国法律。

正规范式为 Markdown/YAML。跨境 RFC 与核心规范的治理语言为英语。

---

## 确定性核心，自然语言界面

OrgOS 是 **确定性软件** — 相同输入产生相同、可审计的输出。

| 层级 | 角色 | 确定性? |
|------|------|:-------:|
| **Data** | 正本（YAML） | 是 |
| **Skill** | 程序 | 是 |
| **CLI** | 执行 | 是 |
| **Agent** | 有界 LLM — 起草、说明、导航 | 部分（仅起草） |

**代理起草。人类审批。CLI 与 Skill 执行。**

Wire 与组织间中继位于协议层；代理不直接发送 Wire。详见 [Module and Agent](/content/module-and-agent)。

---

## 使用 AIA（AI Agent 助理）构建

**AIA** — **A**I **A**gent 助理 — 是 OpenOrgOS 开发与运营的主要工具：

- Community 站点、文档、模块与参考 steward 栈
- RFC 草案、i18n、测试与模块脚手架 — 始终在人工审查之下

在租户内，代理解释 manifest、验证配置并起草委员会提案。它们是 **Steward 助理**，而非自主决策者。

### AIA 为推荐，非必需

| 工具 | 定位 |
|------|------|
| **AIA** | 主要工作流 — 明确且优先 |
| **Cursor** | 附加仓库规则后同样有效 |
| **Claude Code** | 同样有效 |
| **GitHub Copilot** | 同样有效 |
| **自定义代理** | 在相同安全约束下有效 |

详见 [OrgOS with AI Agents](/content/orgos-ai-agents)。

```text
你（自然语言）
    ↓
AI 代理 — AIA、Cursor、Claude Code、Copilot 等
    ↓
Steward 仓库 — manifest、模块、规则
    ↓
Skill → CLI → Data（可审计、可重复）
    ↓
可选：OpenOrgOS Community（公开协议与注册表）
```

---

## 语言无关的设计

协议由 **人类可读的规则与开放规范** 定义，而非单一编程语言。

| 层级 | 当前参考实现 | 可选 |
|------|-------------|------|
| **规则与协议** | Markdown · YAML · 英语 RFC | 任意编辑器、各国模块 |
| **Steward CLI** | TypeScript（参考） | Python · C · Rust · Go 等 |
| **Community Web** | TypeScript · Next.js | 可提供 API 的任意技术栈 |
| **领域模块** | 按领域打包 | 委员会维护，任意语言 |

TypeScript 是对当前代码库的 **务实选择**，而非永久约束。如同 Linux — 内核协议与多种发行版。

---

## 对贡献者的意义

1. **以 Markdown/YAML 提案规则** — 不绑定单一运行时。
2. **使用任意 AI 代理** — AIA 为默认；其他环境适用相同安全规则。
3. **用适合领域的语言实现模块** — 委员会审查协议符合性。
4. **治理贡献使用英语** — 本地执行与翻译归属社区。

---

## 相关文档

| 文档 | 主题 |
|------|------|
| [Mission](/content/mission) | 全球协议目的 |
| [Language Policy](/content/language-policy) | 治理语言与执行语言 |
| [Module and Agent](/content/module-and-agent) | Skill / CLI / Agent 边界 |
| [OrgOS with AI Agents](/content/orgos-ai-agents) | 自然语言操作 OrgOS |
| [Implementation Status](/content/implementation-status) | 当前实现状态 |
