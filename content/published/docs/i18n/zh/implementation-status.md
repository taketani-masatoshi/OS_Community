---
title: OpenOrgOS 实现状态
description: 全球协议、Wire、Community 站点、Commercial Hub 及 X-Road 等国家网关 — 当前已上线内容
---

> **读者：** Stewards、委员会成员、集成方及评估 OpenOrgOS 的合作伙伴。  
> **更新：** 2026-07 — Community 处于 Phase 0；Hub 与国家网关适配器按法域逐步推出。  
> **协议正本：** OrgOS 参考仓库 — 若本页与仓库不一致，**以仓库为准**。

## 概览

OpenOrgOS 分为 **三个可分离的层**。请勿将某层的进展视为另一层已完成。

| 层 | 内容 | 状态 |
|----|------|------|
| **全球协议** | Org Event Model、Identity Exchange、Authority Delegation、Auditability | **已定义** — 词汇与架构见 OrgOS 仓库 |
| **Wire · Witness** | 组织间传输与可验证证据 | **已规格化** — OrgOS 参考实现；非 Community 产品 |
| **OrgOS 运行时** | 本地 Steward 栈（Core、Module、Agent、CLI） | **可用** — 可安装；模块因领域而异 |
| **OpenOrgOS Community**（本站） | OSS 注册表、委员会、治理、学习 | **已上线** — Phase 0 |
| **Commercial Hub** | 按法域的有偿模块 Marketplace | **Phase 0→1** — 尚未销售 |
| **国家网关**（X-Road 类） | 对接国家/地区安全交换网络 | **规划中** — 无已交付适配器；由法域模块定义映射 |

**当前位置：** Community 与 WILD 注册表已运行。Hub 销售与 X-Road 类适配器为 **设计与 cohort 工作**，非本站 live 集成。

---

## 全球协议层

**全球层保持精简**。它定义组织跨边界交换状态的 *方式* — 而非本地业务规则。

| 能力 | 定义 | 运行时 |
|------|------|--------|
| **Org Event Model** | 见使命与 OrgOS 词汇 | OrgOS 内可记录事件；**跨组织 relay 为 P2**（见 Wire） |
| **Identity Exchange** | 已定义 | 当前为租户内身份；联邦交换 **与 Wire 一并规划** |
| **Authority Delegation** | 在模块与 Agent 边界定义 | 租户内可用；跨组织委托 **经 Wire 路径** |
| **Auditability** | 已定义（Witness、时间线） | 租户内可用 |

术语（Module / Agent / Wire）：[Module and Agent](/content/module-and-agent)。

---

## Wire 与 Witness

**Wire** **不是** Module、Agent 或 Hub 产品。它是 org-to-org 消息与事件的 **协议传输层**。**Witness** 提供第三方可审计的可验证证据。

### Wire 在 OrgOS 中的位置

| # | 组件 | 角色 |
|---|------|------|
| 1 | **OpenOrgOS Core** | 规则引擎、租户配置、CLI |
| 2 | **Module linkage** | 领域包（会计、医疗器械等） |
| 3 | **Wire · Witness** | 跨边界交换与审计证据 |
| — | **Agent** | 租户 **内** 有界 LLM 操作者 |

常见纠正：**「Agent 发送 Wire」** 不正确。Wire 在协议层；Agent **起草**；人类 **批准**；**CLI / Skill** 确定性执行。

### 实现状态

| 项目 | 状态 |
|------|------|
| 词汇与架构（`orgos-vocabulary.md` 等） | OrgOS 仓库 **已发布** |
| 租户内操作（Skill、CLI、Agent、Module） | 已安装 OrgOS **可用** |
| **Org Event relay**（组织间网关） | **P2 规划** — Control Plane 待办；Community 未上线 |
| `community.oorgos.org` 上的公开 Wire 端点 | **不提供** — Community 为注册/治理，非 Wire hub |

Relay 上线后 **不会** 取代法域专用网关；它在参与组织间承载 **OpenOrgOS 形态事件**。

---

## Commercial Hub

**Hub** 为 **Commercial 渠道** — 持证运营商按 **法域** 销售与支持模块。与 Community 审查分离。

| 项目 | 状态 |
|------|------|
| 本站 WILD + Community 模块注册表 | **已上线** — [/modules](/modules) |
| 委员会与治理 | **已上线** — [/committees](/committees), [/governance](/governance) |
| Candidate 流水线 + Program Fund | **Phase 1 准备** — cohort 与 Assess 已定义，未完全自动化 |
| Commercial Hub Marketplace | **未上线** — 首个法域 cohort 进行中 |
| Hub 中的 Agent 产品 | **现阶段不在范围** — 模块优先 |

阶段详情：[Module ecosystem](/content/module-ecosystem)。

**Community `REVIEWED` ≠ Commercial 就绪。** Commercial 上架需 **Hub 路径**，非仅注册表晋升。

---

## X-Road 与国家交换网关

### X-Road 是什么

**[X-Road](https://x-road.global/)** 是 **国家（或区域）安全数据交换层** — 成员组织经安全服务器连接；访问由政策与合同治理（爱沙尼亚、芬兰等 NIIS 成员）。

X-Road 回答：*「我的组织如何接入 **本国** 可信交换 fabric？」*

### 与 OpenOrgOS 的关系

| | **OpenOrgOS Wire** | **X-Road 类网关** |
|---|-------------------|-------------------|
| 范围 | OpenOrgOS 形态的 **org-to-org 事件与状态交换** | **国家基础设施** 成员资格与技术网关 |
| 所有者 | 参与组织 + 协议规格 | 国家/地区运营方（如 NIIS 成员） |
| 内容 | Org 事件、委托、审计信封 | 成员特定消息与国内 schema |
| OpenOrgOS 角色 | **语义模型** 与 Steward 运行时 | **不替代** X-Road — 在委员会要求处 **互操作** |

OpenOrgOS **当前未交付生产级 X-Road 适配器**。跨境/公共部门场景预期组合：

1. **OrgOS 运行时**（本地正本），
2. **Wire**（OpenOrgOS org-to-org 事件，relay 可用后），
3. **法域模块 + 网关适配器**（国家网关消息 ↔ Org Event Model 映射）。

### 状态与下一步

| 项目 | 状态 |
|------|------|
| Community 注册表中的 X-Road 适配器模块 | **尚无** |
| OrgOS 仓库参考适配器 | **未交付** |
| 公共部门/网关互操作委员会章程 | **欢迎参与** — 领域与法域委员会 |
| 网关配置的 OOO RFC 路径 | **可用** — 经 OOO Program 标准化 |

若在 X-Road 成员环境中需要 OpenOrgOS 互操作，请 **提议法域模块** 或加入相关 [委员会](/committees) — 网关映射为 **本地规则**，非全球协议。

---

## OpenOrgOS Community 站点（本站）

`community.oorgos.org` 当前实现：

| 能力 | 状态 |
|------|------|
| 模块注册表（WILD、生命周期） | **已上线** |
| WILD 模块提案 | **已上线** |
| 委员会与领域治理 | **已上线** |
| 认证与角色申请 | **已上线** |
| Identity（Google 登录；GitHub / LinkedIn 连接） | **已上线** |
| 学习指南与文档（`/content/*`） | **已上线** |
| Academy 课程 | **部分** — 取决于 Academy 服务配置 |
| Commercial Hub / 支付 | **不在本站** |
| Wire / Org Event 入口 | **不在本站** |

基础设施：概览见 [oorgos.org](https://oorgos.org)；Community 为 Steward 部署 + Cloudflare Tunnel（见仓库 `docs/`）。

---

## OrgOS 运行时（本地）

在自有硬件安装 OrgOS 的 Steward：

| 项目 | 状态 |
|------|------|
| 安装与数字孪生设置指南 | **已发布** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core Agent（Finance、Secretary、Steward 等） | 参考栈 **可用** |
| 领域模块（rental、jp_medical_device 等） | **因模块而异** — [/modules](/modules) |
| Control Plane 心跳 / outbound agent | **架构已定义** — `docs/plans/` |
| 向其他组织的 Org Event relay | **P2 — 未 GA** |

---

## 路线图摘要

| 阶段 | 重点 | 代表交付物 |
|------|------|------------|
| **当前（Phase 0）** | Community OSS、注册表、委员会 | 本站、WILD、治理 |
| **Phase 0→1** | 首个 Hub cohort | 单法域手动 Commercial 路径 |
| **Phase 1–2** | Candidate + Assess + Program Fund | 付费审计准备流水线 |
| **协议 P2** | Org Event relay（Wire 网关） | 跨组织事件传输 |
| **按法域** | X-Road / 国家网关适配器 | 模块 + 委员会定义映射 |

---

## 相关链接

| 资源 | 链接 |
|------|------|
| Module ecosystem（Hub 阶段） | [/content/module-ecosystem](/content/module-ecosystem) |
| Module / Agent / Wire 术语 | [/content/module-and-agent](/content/module-and-agent) |
| 使命与全球协议 | [/content/mission](/content/mission) |
| 模块注册表 | [/modules](/modules) |
| 治理 | [/governance](/governance) |
| OrgOS 安装指南 | [/content/orgos-install-setup](/content/orgos-install-setup) |
| 全部文档 | [/content](/content) |
