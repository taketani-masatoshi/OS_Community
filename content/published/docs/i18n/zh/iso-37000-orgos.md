---
title: OrgOS 与 ISO 37000
description: OrgOS 初始化如何为符合 ISO 37000 的治理自我声明提供实务基础。
---

# OrgOS 与 ISO 37000

**OrgOS** 把部署与治理放在同一路径：在**初始化**时，目的、角色、监督与可审计性成为一体基线。

该基线支撑对 **ISO 37000**（《组织的治理》— 指南）的可信**自我声明**。OpenOrgOS Community 不颁发第三方 ISO 证书。

## 社区提供什么

OpenOrgOS Community 是协议、模块、学习与运营者路径的**中立家园**。治理主张、方针与文化仍由各成员组织负责。

| 术语 | 定义 |
|------|------|
| **OrgOS** | 运行在你所掌控基础设施上的组织运行时 |
| **OOO** | [OpenOrgOS Operator](/certifications) — 部署与日常运营的参考角色 |
| **ISO 37000** | 关于组织治理的国际指南 |
| **自我声明** | 组织自身的对齐声明 — 不同于认可认证 |

ISO 37000 是**指南**，不是 ISO 9001 那样的可认证要求标准。OrgOS 使评估从首次部署起即可**运行并有证据**。

## 步骤

1. **部署** — 在自有硬件上安装 OrgOS（[安装指南](/content/orgos-install-setup)）
2. **准备** — 法律身份、结构、法域、模块意向
3. **初始化** — `orgos tenant init` 写入目的骨架与 ISO 37000 声明草稿
4. **检查** — `orgos governance principles status`。占位 mission/vision 不算 ready
5. **声明** — 仅由人执行：`orgos governance principles declare --signatory "…"`

通常由 **OpenOrgOS Operator（OOO）** 主导该路径。

## 主题对应（示例）

| ISO 37000 原则 | OrgOS 帮助建立的内容 |
|----------------|----------------------|
| **Purpose** | 商业计划中的使命、愿景与价值观 |
| **Value and strategy** | 计划、KPI、预算闸门 |
| **Oversight** | 公司事件、董事会/股东会记录、Operator Console |
| **Accountability** | 具名运营者、RBAC、禁止自我批准 |
| **Stakeholders** | 顾问、治理台账、IR / Wire |
| **Leadership** | 人的最终批准、登录域、PassKey |
| **Data and decisions** | YAML 正本、analytics、dashboard |
| **Risk** | 风险台账；启用 ISO 27001 时的 ISMS 风险记录 |
| **Social responsibility** | ESG / 环境相关规程（适用时） |
| **Viability** | 多年计划、负债计划、租户生命周期 |

## 「自我声明准备」的范围

**范围内：** 可运行的体制与决策轨迹；目的 → 结构 → 监督的说明路径；`orgos governance principles status`。

**范围外：** Community 自动颁发 ISO 证书；法律意见；ISO 37001（反贿赂）或 ISO 37301（CMS）— 另有独立包。

## 下一步

| 行动 | 资源 |
|------|------|
| 理解 OrgOS | [Learning](/learning#about-orgos) |
| 部署 | [OrgOS Install](/content/orgos-install-setup) |
| 运营者路径 | [Certifications](/certifications) |
| 社区治理 | [Governance](/governance) |
