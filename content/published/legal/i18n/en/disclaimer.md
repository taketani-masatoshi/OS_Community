---
title: Disclaimer
description: Responsibility boundaries for OpenOrgOS Community
---

# Disclaimer · Responsibility boundaries

Last updated: 2026-07-09

## 1. Community scope

OpenOrgOS Community is responsible only for **developing and distributing the OSS framework** (Steward core, jurisdiction packs, official modules):

- Publishing source code (read-only clone)
- Module governance (Maintainer and contributor management)
- Documentation and reference certification programs

## 2. Tenant (organization) responsibility

Each organization is responsible for:

- Company data under `tenants/{id}/data/` and `docs/`
- Deployment and backup on Mac mini, Synology NAS, or other infrastructure
- Module enable/disable decisions, policy enforcement, and operational outcomes
- Security configuration and access control

**We do not provide functionality to upload tenant data to the Community site.**

## 3. Wild modules

For modules registered with `trust_level: wild`:

- The Community provides **no warranty, security audit, or maintenance**
- Compatibility checks (`steward modules check`) are **your responsibility**
- A disclaimer must be accepted before connection

## 4. External services

OAuth providers (Google, GitHub, LinkedIn) and third-party infrastructure are subject to their own terms. We are not liable for their outages or policy changes.

## 5. Limitation of liability

The Service is provided “as is” to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from use of the Site or OrgOS software deployed on your infrastructure.
