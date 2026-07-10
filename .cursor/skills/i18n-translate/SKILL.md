---
name: i18n-translate
description: >-
  Translates OpenOrgOS Community UI strings from English canonical JSON to all
  supported locales (ja, pt, es, zh, et, fr, de, ru). Use when adding or
  changing i18n keys, fixing untranslated English in governance tables, or
  updating packages/shared/i18n JSON files.
---

# OpenOrgOS i18n Translation Workflow

English is the **only canonical source**. Never translate from Japanese or other locales.

## Directory layout

```
packages/shared/i18n/
├── en/                    # EDIT HERE FIRST (full trees)
│   ├── core.json
│   ├── pages.json
│   ├── labels.json
│   ├── forms.json
│   ├── user-pages.json
│   ├── openness-policy.json
│   └── errors.json
├── locales/{locale}/      # Overrides only (diff from en)
│   └── *.json
└── (generated → packages/shared/src/i18n/generated/bundles.ts)
```

Supported locales: `ja`, `pt`, `es`, `zh`, `et`, `fr`, `de`, `ru`.

## Standard procedure

Copy this checklist and complete in order:

```
- [ ] 1. Edit English canonical JSON under i18n/en/
- [ ] 2. Add dictionary entries when reusing English phrases:
   - `scripts/i18n/extra-translations.mjs` — general UI
   - `scripts/i18n/ehr-metaphor-translations.mjs` — organizational EHR copy
   - `scripts/i18n/user-pages-admin-translations.mjs` — admin user management
- [ ] 3. npm run i18n:sync          (dict → fill → build → strict check → API check)
- [ ] 4. For API errors: add code to i18n/en/errors.json, use apiErrorResponse(code, status)
- [ ] 5. npm run build               (TypeScript compile)
```

## Quality gates (CI)

These must pass before merge:

| Command | What it enforces |
|---------|------------------|
| `npm run i18n:sync` | Key parity, no untranslated strings (`--strict`), regenerated bundles, no hardcoded API errors, **UserPagesMessages type parity** |
| `npm run i18n:check` | Same as sync minus dict/fill/build (read-only validation) |
| `npm run i18n:check:api` | API routes must use `apiErrorResponse()`, not `NextResponse.json({ error: "..." })` |

## Rules

1. **English first** — add or change keys only in `i18n/en/*.json`.
2. **Overrides only** — locale files contain **only strings that differ from English**. Do not copy the full English tree.
3. **Preserve placeholders** — keep `{completed}`, `{total}`, `{name}` etc. unchanged.
4. **Namespace discipline** — one PR should touch one namespace when possible (`core`, `pages`, `labels`, `forms`, `user-pages`, `openness-policy`, `errors`).
5. **Governance table** — translate column headers (`user`, `contributor`, `reviewer`, `maintainer`, `committee`) and row labels; do not leave English role names in non-English locales unless they are official product terms defined in `labels.json`.
6. **API errors** — add codes to `i18n/en/errors.json` first, then locale overrides. Use `getErrorMessage(locale, code)` from `@os-community/shared`.

## Namespace guide

| File | Used for |
|------|----------|
| `core.json` | nav, brand, home, governance (Messages), login, footer |
| `pages.json` | module pages, academy UI, admin pages, content |
| `labels.json` | siteRole, moduleRole, communityRoles, promotionFlow |
| `forms.json` | form labels, buttons, validation messages |
| `user-pages.json` | profile, register, admin/users copy |
| `openness-policy.json` | `/governance/openness` page |
| `errors.json` | API error codes (English codes as keys) |

## Commands

```bash
npm run i18n:check       # validate key parity + untranslated strings (strict)
npm run i18n:check:api   # no hardcoded API error strings
npm run i18n:build       # regenerate src/i18n/generated/bundles.ts
npm run i18n:sync        # dict + fill + build + check + check:api (full pipeline)
```

## Fixing untranslated warnings

`i18n:check` prints lines like:

```
[core/fr] untranslated: governance.permissionHeaders.contributor
```

Add to `i18n/locales/fr/core.json`:

```json
{
  "governance": {
    "permissionHeaders": {
      "contributor": "Contributeur"
    }
  }
}
```

Nested JSON mirrors the English key path.

## Do not edit

- `packages/shared/src/i18n/generated/bundles.ts` — auto-generated
- Inline locale objects in TypeScript — removed; JSON is the source of truth

## Re-export from legacy TS (maintenance only)

If migrating old inline strings back to JSON:

```bash
npm run i18n:export -w @os-community/shared
npm run i18n:build -w @os-community/shared
```

Only use `i18n:export` when bootstrapping from TypeScript; normal workflow edits JSON directly.
