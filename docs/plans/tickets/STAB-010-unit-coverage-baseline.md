# STAB-010: unit coverage 基準設定

**ID**: STAB-010  
**Phase**: C  
**Estimate**: 1d  
**要件**: R6  
**Depends**: STAB-004

## 目的

vitest coverage を有効化し、未テストの critical lib に下限を設ける。

## 優先テスト対象

| lib | 理由 |
|-----|------|
| `admin-users.ts` | 拡張済み、回帰重要 |
| `progress-service.ts` | Academy/DB 境界 |
| `session.ts` | 全 API 認可 |
| `db-health.ts` | 障害判定 |
| `content.ts` | CONTENT_ROOT 解決 |

## タスク

- [ ] `vitest.config.ts` に coverage provider + `lib/**` include
- [ ] 上記 5 モジュールに最低 1 test file
- [ ] CI で coverage report（閾値 warn のみ、fail は Phase D）

## 受け入れ条件

- [ ] lib coverage ≥ 40%（lines）
- [ ] `npm run test -- --coverage` ローカル実行可能
