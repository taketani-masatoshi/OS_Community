# Web 安定性リファクタリング — 要件定義

**版**: 1.0  
**日付**: 2026-06-29  
**対象**: `apps/web`（OpenOrgOS Community ポータル）  
**関連**: [web-stability-checklist.md](../web-stability-checklist.md)、[web-stability-refactor-tickets.md](./web-stability-refactor-tickets.md)

---

## 1. 背景と目的

### 1.1 背景

Community Web は App Router + NextAuth + Prisma + Academy BFF として MVP 機能を実装済みである。一方で以下が残存し、本番 SLA・水平スケール・開発者体験のボトルネックとなっている。

| 観点 | 現状 |
|------|------|
| 異常入力耐性 | `e2e/resilience.spec.ts`（46 件）で 500 回避を確認済み。API エラー形式は一部未統一 |
| 品質ゲート | `npm run quality`（build/lint/i18n/unit）あり。resilience e2e は CI 未必須 |
| 認可 | ページ単位 `requireRole`。`admin/layout.tsx` なし |
| 依存障害 | DB/Academy 停止時の挙動が route ごとにばらつく |
| 性能 | root `force-dynamic` により静的コンテンツの cache が効きにくい |
| 運用 | レート制限 in-memory、deploy CI は placeholder |

### 1.2 目的

1. **安定性要件を文書化**し、リファクタの判断基準を共有する  
2. **現状ベースラインを計測可能**にし、改善を追跡する  
3. **チケット単位で段階的 refactor** できるよう準備する  

### 1.3 スコープ

| 含む | 含まない |
|------|----------|
| `apps/web` の API / ページ / middleware / lib | `apps/cloud-*`（southwood.cloud） |
| CI・quality gate・E2E | OS_Content / OS_Steward の内部実装 |
| Docker prod 構成の検証 | 本番 VPS への自動デプロイ実装（別 epic） |

### 1.4 非機能要件（NFR）サマリー

| ID | 要件 | 目標 |
|----|------|------|
| NFR-01 | **可用性** | 単一異常リクエストでプロセスが落ちない（500 率 ≈ 0 on abuse） |
| NFR-02 | **劣化運転** | DB/Academy 不可時、503 または安全 redirect。未処理 throw 禁止 |
| NFR-03 | **認可** | 管理 API/UI は ADMIN/CERT_REVIEWER 以外 403/redirect |
| NFR-04 | **一貫性** | API エラー JSON は `{ code, error }` + i18n（Academy BFF 含む） |
| NFR-05 | **検証可能性** | `npm run quality` + resilience e2e が CI green |
| NFR-06 | **運用** | prod compose + health + migrate entrypoint が検証済み |
| NFR-07 | **性能（段階2）** | 公開 Markdown ページで ISR/cache 再利用可能 |

---

## 2. 現状アーキテクチャ（As-Is）

```
Browser
  → middleware (NextAuth, profileComplete redirect)
  → App Router pages (SSR, root force-dynamic)
  → API Route Handlers
       ├─ session.ts (requireAuthApi / requireRoleApi)
       ├─ api-error.ts + readJsonBody
       ├─ Prisma (@os-community/db)
       └─ Academy BFF → ACADEMY_API_URL (Content API)
```

### 2.1 規模（2026-06-29 時点）

| 項目 | 数量 |
|------|------|
| API Route Handlers | 29 |
| lib モジュール | 84 |
| unit test ファイル | 20（100 tests） |
| e2e spec | 7（resilience 46 cases 含む） |

### 2.2 確立済みパターン（維持・拡張する）

- `readJsonBody` → malformed JSON は 400  
- `apiErrorResponse(code, status)` → i18n 化  
- `requireAuthApi` / DB 停止時 503  
- `handleAcademyLoadError` / `page-guard.ts` → Academy 不可時 redirect  
- `enforceAdminRateLimit` → 管理 write API  
- `checkDatabaseHealth` → `/api/health`  

---

## 3. ギャップ分析（Gap）

### 3.1 P0 — 500・認可漏れ・CI ギャップ

| # | ギャップ | 根拠 |
|---|----------|------|
| G-01 | `admin/certifications` が `req.json()` 直叩き | malformed JSON → 500 リスク |
| G-02 | Academy BFF エラー形式が `{ error: { code, message } }` で i18n 非対応 | `server-client.ts` |
| G-03 | `admin/layout.tsx` なし | 新規 admin ページで requireRole 漏れ可能 |
| G-04 | `github/provision` が `auth()` 直叩き | DB 停止時 requireAuthApi と挙動不一致 |
| G-05 | resilience e2e が `quality-gate.sh` / CI build に未組込 | 回帰検知弱い |
| G-06 | middleware と `auth.ts` で NextAuth 二重初期化 | 設定ドリフトリスク |

### 3.2 P1 — 運用・スケール

| # | ギャップ | 根拠 |
|---|----------|------|
| G-07 | レート制限 in-memory（30 req/min） | 再起動・多インスタンスで無効 |
| G-08 | root `force-dynamic` | `learning` 等の revalidate 無効化 |
| G-09 | GitHub webhook `installation_repositories` が user 100 件 provision | スケール/誤爆 |
| G-10 | `progress-service` が ACADEMY 未設定時 throw しうる | DB 操作 path との境界不明瞭 |
| G-11 | CI e2e に `ACADEMY_API_URL` 未設定 | Academy 連携の CI 検証なし |

### 3.3 P2 — 保守性

| # | ギャップ | 根拠 |
|---|----------|------|
| G-12 | `auth.ts` 400 行超・callbacks 集中 | identity merge 等の変更コスト |
| G-13 | `error.tsx` 英語固定 | i18n 未対応 |
| G-14 | README vs checklist の起動 URL 手順が並立 | 運用混乱 |
| G-15 | deploy CI placeholder | 本番反映手順がコード化されていない |
| G-16 | unit カバレッジ未計測 | committees/content/progress-service 等未テスト |

---

## 4. 要件カテゴリ（To-Be）

リファクタ epic を **R1〜R9** に分割する。各カテゴリに機能要件（FR）と受け入れ条件（AC）を定義する。

### R1: API Contract（G-01, G-02）

**FR-R1-1** 全 POST/PATCH/PUT は `readJsonBody` または同等の try/catch を経由する。  
**FR-R1-2** 入力は Zod で検証し、失敗時 `apiErrorResponse("VALIDATION", 400)`。  
**FR-R1-3** Academy BFF も `{ code, error }` 形式に統一するか、クライアント adapter で変換する。  
**FR-R1-4** `i18n:check:api` を Academy BFF route にも拡張する。

**AC-R1**
- [ ] `scripts/audit-web-stability.mjs` の `rawJsonRoutes` が 0  
- [ ] `e2e/resilience.spec.ts` 全 pass  
- [ ] Academy BFF 4xx/503 が JSON parse 可能  

### R2: AuthZ Boundary（G-03, G-04, G-06）

**FR-R2-1** `app/admin/layout.tsx` で `requireRole(["ADMIN","CERT_REVIEWER"])` を集中適用。  
**FR-R2-2** 全 API は `requireAuthApi` / `requireRoleApi` / `requireProfileCompleteApi` のいずれか。  
**FR-R2-3** middleware の NextAuth 初期化を edge-safe な共有モジュールに寄せる。

**AC-R2**
- [ ] 新規 `/admin/*` ページが layout 継承のみで保護される  
- [ ] 未認証 `/api/admin/*` → 401（resilience 既存 + 拡張）  
- [ ] `auth()` 直叩き API が 0（audit script）  

### R3: Dependency Degradation（G-10, NFR-02）

**FR-R3-1** DB 不可時: API 503、ページは login/admin 等で明示メッセージ。  
**FR-R3-2** Academy 不可時: BFF 503、ページは `/learning` redirect または unavailable UI。  
**FR-R3-3** `progress-service` を「DB-only」「Academy 必要」に層分離。

**AC-R3**
- [ ] 障害マトリクス（下表）の契約テストが unit または e2e で存在  
- [ ] `/api/health` が degraded を正しく返す  

| 依存 | API 期待 | ページ期待 |
|------|----------|------------|
| DB down | 503 + code | login 等で DB 不可表示 |
| Academy down | 503 | learning redirect / unavailable |
| Auth misconfig | 503 health | login に provider 未設定表示 |

### R4: Observability（NFR-06）

**FR-R4-1** 構造化ログ（route, code, userId hash）を admin write / 5xx で出力。  
**FR-R4-2** `/api/health` を smoke-prod / 監視の唯一の liveness として文書化。

**AC-R4**
- [ ] `scripts/smoke-prod.sh` pass  
- [ ] runbook に health アラート閾値記載  

### R5: Rate Limit & Abuse（G-07, NFR-01）

**FR-R5-1** 管理 write API は rate limit 必須（現状維持 + 文書と実装の一致）。  
**FR-R5-2** 段階2: Redis/Upstash 等への外部化設計。

**AC-R5**
- [ ] checklist の rate limit 記載と `ADMIN_LIMIT` 一致  
- [ ] resilience で 429 が stable（500 にならない）  

### R6: Test Pyramid（G-05, G-11, G-16, NFR-05）

**FR-R6-1** `quality-gate.sh` ≡ CI build ジョブ + resilience e2e。  
**FR-R6-2** e2e global-setup の founder cookie 形式を全 signed-in spec で共有。  
**FR-R6-3** 重要 lib（admin-users, progress-service, session）に unit 追加。

**AC-R6**
- [ ] `npm run quality:full`（新設）がローカル・CI で green  
- [ ] vitest coverage 閾値（lib 40% 目標）を設定  

### R7: Build / Deploy Safety（NFR-06）

**FR-R7-1** `guard-dev-build.mjs` 維持。  
**FR-R7-2** prod entrypoint migrate + healthcheck 維持。  
**FR-R7-3** deploy ジョブは compose validate 以上（段階2: smoke-prod in CI nightly）。

**AC-R7**
- [ ] `docker compose -f docker-compose.prod.yml config` CI pass  
- [ ] checklist §本番 と docs 同期  

### R8: Performance Baseline（G-08, NFR-07）

**FR-R8-1** session 不要な公開ページから root dynamic 依存を除去。  
**FR-R8-2** Header の session 表示を Client 境界または partial prerender に分離。  
**FR-R8-3** Academy BFF GET に cache/revalidate 方針を明文化。

**AC-R8**
- [ ] `/governance`, `/modules` 等が static/ISR 可能  
- [ ] TTFB ベースライン計測値を ADR または checklist に記録  

### R9: Content Path Determinism

**FR-R9-1** 本番は `CONTENT_ROOT` 必須。dev でも未設定時 warn。  
**FR-R9-2** registry 読込失敗は build 時 fail-fast（可能な範囲）。

**AC-R9**
- [ ] Docker prod で content パスが単一  
- [ ] monorepo root から dev 起動で content 解決  

---

## 5. リファクタリング原則

1. **挙動互換優先** — 公開 URL・API 契約は breaking change を避ける  
2. **小 PR** — STAB チケット 1 件 ≦ 1 PR（目安 300 行以内）  
3. **テスト先行** — ギャップに対し resilience または unit を先に追加  
4. **監査で完了判定** — `node scripts/audit-web-stability.mjs` の指標で Done  
5. **i18n 維持** — 新規エラーは `errors.json` + `apiErrorResponse`  

---

## 6. フェーズ計画

| フェーズ | 期間目安 | チケット | 成果 |
|----------|----------|----------|------|
| **Phase A** | 1 週 | STAB-001〜004 | P0 解消、quality+resilience CI |
| **Phase B** | 2 週 | STAB-005〜007 | 劣化運転・webhook・progress 境界 |
| **Phase C** | 2 週 | STAB-008〜010 | auth 分割、layout 性能、coverage |
| **Phase D** | 継続 | STAB-011〜 | rate limit 外部化、deploy 自動化 |

---

## 7. ベースライン計測

初回実行:

```bash
node scripts/audit-web-stability.mjs
```

出力 `docs/plans/web-stability-baseline.json` を PR ごとに diff し、ギャップ削減を追跡する。

---

## 8. 用語

| 用語 | 定義 |
|------|------|
| stable | HTTP 500 を返さない（4xx/503 は許容） |
| BFF | Community Web が Content API を代理する `/api/academy/*` |
| quality gate | `scripts/quality-gate.sh` および CI build ジョブ |

---

## 9. 改訂履歴

| 版 | 日付 | 変更 |
|----|------|------|
| 1.0 | 2026-06-29 | 初版（現状調査 + R1〜R9 + フェーズ計画） |
