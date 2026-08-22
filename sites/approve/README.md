# approve — Settlement PassKey help (ADR 0037 · Phase 3)

Static **help only**. WebAuthn ceremonies run on the Operator Console origin
(`WIRE_CONSOLE_WEBAUTHN_RP_ID` / `WIRE_CONSOLE_WEBAUTHN_ORIGIN`), not here.

| Path | Role |
|------|------|
| `/` · `/enroll` | Explain hybrid QR flow · link to console |

## Local Docker

```bash
cd /Users/kk/OS_Community
./scripts/start-local-stack.sh
# help: http://localhost:4178/
# ceremony: http://127.0.0.1:9470/
```

`ORGOS_SETTLEMENT_APPROVE_ORIGIN` may still point here for deprecated `qr_url`
help links. It is **not** the WebAuthn RP.

Canonical: OS_Steward `docs/org-os/passkey-iphone-qr-implementation-plan.md` · ADR 0037.
