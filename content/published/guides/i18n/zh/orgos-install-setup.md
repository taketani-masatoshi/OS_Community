---
title: OrgOS 安装与数字孪生环境准备
description: 从零安装 OrgOS，整理组织信息，并准备数字孪生构建环境。
---

> **概述：** [学习中心的「什么是 OrgOS？」](/learning#about-orgos) — 确定性程序、自然语言 AI 操作与模块化扩展。

本指南面向 **Steward Operator**，说明首次部署：前置条件、`tenant init` 前的信息整理，以及**数字孪生**基线（组织架构、模块、审计）。

OrgOS 的**业务数据保留在您的基础设施上**。OpenOrgOS Community（`openorgos.net`）提供协议、模块注册表与学习资源 — 不托管租户数据。

## 适用对象

| 角色 | 目标 |
|------|------|
| **Steward Operator** | 在无专职 IT 的情况下于公司硬件运行 Org Console |
| **创始人 / 赞助人** | 了解上线前需准备的内容 |
| **Steward（顾问）** | 交付前验证客户环境 |

## 完成后的状态

1. 已准备好可运行基于 Docker 的 OrgOS 的机器
2. 组织事实清单已整理（结构、法域、模块）
3. 租户已初始化且配置已通过 validate
4. 数字孪生最小范围：组织架构、启用模块与审计连接

## 阶段 0 — 先收集的信息

在 `tenant init` 之前请整理：

### 组织身份

- 法定名称、商号与主要法域
- 财年与报告货币
- 日常 **Steward Operator** 联系人

### 结构（数字孪生种子）

- 部门 / 团队与汇报线
- 关键角色 — 可映射到 [Steward 代理](/agents)
- 交换 org event 的外部主体

### 模块意图

查阅[模块注册表](/modules#registry)：

| 领域 | 示例 | 首发？ |
|------|------|--------|
| 治理 | 提案、委员会 | 通常需要 |
| 财务 | 发票、合同 | 按需 |
| 运营 | 库存、排程 | 按需 |

### 数据边界

- **不得**离开 Mac mini 的数据（PII、合同、账本明细）
- 可汇总到可选 SaaS 仪表板的内容（只读）

## 阶段 1 — 硬件与网络

| 组件 | 用途 |
|------|------|
| **Mac mini**（或等效常开主机） | Org Runtime + Org Console — **权威数据源** |
| **Synology NAS**（可选） | 备份、制品存储 |
| 稳定局域网 | 内网访问 Org Console |
| 出站 HTTPS | GitHub、模块注册表、可选 Control Plane 心跳 |

## 阶段 2 — 软件前置

```bash
docker --version
docker compose version
git --version
```

- 可访问 OrgOS / Steward 仓库的 **GitHub** 账户
- [openorgos.net](/login) 的 Community 账户
- `.env` 仅保存在主机 — 切勿提交凭据

## 阶段 3 — 克隆与配置

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# 编辑：TENANT_SLUG、JURISDICTION、ENABLED_MODULES、DATABASE_URL、AUTH_*
docker compose up -d
curl -sk https://localhost/health
```

健康检查通过后再继续。

## 阶段 4 — `tenant init` 与 validate

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

遵循 steward 仓库 README。上线前解决所有错误。

## 阶段 5 — 数字孪生基线

| 层 | 配置内容 |
|----|----------|
| **Identity** | 人员、角色、关联账户 |
| **Authority** | 委托、委员会范围 |
| **Events** | 模块生成的 org event |
| **Agents** | [代理注册表](/agents) |

- [ ] 执行与财务角色已分配给实际人员
- [ ] Console 中可见至少一条测试 org event
- [ ] 启用模块已写入 runbook
- [ ] 已测试备份（DB + 配置）

## 阶段 6 — 下一步

| 下一步 | 链接 |
|--------|------|
| 使用 AI（Cursor） | [OrgOS 与 AI 代理](/content/orgos-ai-agents) |
| OrgOS 概述 | [学习中心](/learning#about-orgos) |
| 课程 | [学习 → 课程](/learning#curriculum) |

## 故障排除

| 症状 | 可能原因 |
|------|----------|
| OAuth 失败 | 浏览器 URL ≠ `.env` 中的 `AUTH_URL` |
| 数据库连接错误 | Docker 网络内 `DATABASE_URL` 主机名错误 |
| 模块加载失败 | 未在注册表中或 tenant init 时未启用 |

## 相关阅读

- [OpenOrgOS 使命](/content/mission)
- [Stewardship 模型](/content/stewardship-model)
- [代理注册表](/agents)
