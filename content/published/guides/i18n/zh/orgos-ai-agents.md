---
title: 使用 AI 代理操作 OrgOS（Cursor）
description: 使用 Cursor 等 AI 代理，以自然语言理解并操作 OrgOS。
---

> **概述：** [学习中心的「什么是 OrgOS？」](/learning#about-orgos) — 通过 LLM 与 AI 代理以自然语言操作确定性程序。

**前提：** 已完成 [OrgOS 安装与数字孪生环境准备](/content/orgos-install-setup)，或本地租户已运行。

## AI 代理能做什么

| 能力 | 示例 |
|------|------|
| **解释** | 「finance 代理的 manifest 允许哪些操作？」 |
| **导航** | 「此租户启用了哪些模块？」 |
| **起草** | 「为 JP 法域写一份委员会提案模板」 |
| **验证** | 「运行 validate 并总结失败项」 |
| **运营辅助** | 「列出本周分配给 operations 的开放 org event」 |

代理**不能替代治理**。审批、委托与审计规则仍然有效 — 请将代理视为 **Steward 助手**，而非自主高管。

## 架构概览

```text
您（自然语言）
    ↓
Cursor 代理（读取仓库 + 工具）
    ↓
Steward 仓库 — agent.manifest.yaml、模块、脚本
    ↓
Org Runtime / Org Console（本地 — 数据留在此处）
    ↓
可选：OpenOrgOS Community（仅公开协议与注册表）
```

核心代理定义位于 `steward/agents/`。Community [代理注册表](/agents) 为公开目录 — 租户可在本地扩展或覆盖。

## 步骤 1 — 在 Cursor 中打开 steward 工作区

1. 克隆组织的 Steward / OrgOS 仓库（与 Org Console 同一主机）。
2. Cursor：**File → Open Folder** → 仓库根目录。
3. 确认代理树存在，例如 `steward/agents/executive/agent.manifest.yaml`。

等待索引完成以便 `@Codebase` 搜索 manifest 与文档。

## 步骤 2 — 项目规则（推荐）

`.cursor/rules/orgos.mdc` 或 **Cursor Settings → Rules** 示例：

- 勿将业务数据或 `.env` 密钥粘贴到公开聊天
- 提议写入前先只读检查
- 遵守 `tenant.yaml` / `.env` 中的法域与模块边界
- 配置变更后运行 `./scripts/validate.sh`

## 步骤 3 — 连接上下文

| 来源 | 在 Cursor 中的附加方式 |
|------|------------------------|
| 租户配置 | `@.env.example`、`@tenant.yaml`（脱敏） |
| 组织架构导出 | `@exports/org-chart.csv` |
| 模块列表 | `@modules/enabled.json` 或注册表链接 |
| 入职笔记 | `@docs/onboarding-checklist.md` |
| 代理注册表 | `/agents` 或 `@steward/agents/` |

## 步骤 4 — 自然语言模式

### 探索（只读）

- 「总结 compliance 与 finance 代理的权限差异。」
- 「说明 org event 从模块 X 到审计日志的流程。」

### 配置（草案 → 人工审阅）

- 「为 JP 20 人服务公司起草启用模块列表 — 表格格式。」
- 「逐行解释 validate.sh 输出」（在终端运行后粘贴）

### 运营（谨慎 — 仅本地）

- 「列出接触生产数据的脚本；区分读/写。」

未经明确人工批准，避免破坏性命令。

## 步骤 5 — 代理注册表

[代理注册表](/agents) 映射领域：

| 代理 | 领域 | 典型问题 |
|------|------|----------|
| executive | governance | 战略、审批、委员会路由 |
| secretary | governance | 日程、纪要、通信 |
| finance | finance | 发票、账本策略 |
| contract | finance | 合同生命周期 |
| compliance | finance | 合规检查 |
| operations | operations | 日常队列 |

注册表更新后同步本地 manifest（仓库中 `npm run sync:agents` 等）。

## 步骤 6 — MCP 与终端（可选）

- 优先使用**只读** MCP 工具
- 终端运行 `docker compose ps`、`validate.sh` 与日志 tail — 将输出粘贴回聊天
- 勿将 Org Console 管理端口暴露到公网

## 安全清单

- [ ] 代理针对**本地** steward 克隆运行
- [ ] `.env` 密钥 — 代理仅见占位符
- [ ] 写入操作由 Steward Operator 审阅
- [ ] 代理建议的配置变更后 validate 通过

## 下一步

| 资源 | 链接 |
|------|------|
| 安装与数字孪生 | [安装指南](/content/orgos-install-setup) |
| OrgOS 概述 | [学习中心](/learning#about-orgos) |
| 课程 | [学习 → 课程](/learning#curriculum) |
| 模块 | [模块注册表](/modules#registry) |
