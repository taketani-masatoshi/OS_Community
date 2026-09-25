# 公開前の品質ゲート

`publish-image.yml` は同じ Community commit の `ci.yml` を呼び、build・Docker build・E2E が成功した後に GHCR へ公開します。通常 CI の deploy 確認ジョブも E2E 成功を待ちます。

コンテナ公開では repository variables を設定します。

- `STEWARD_REPO`: 接続対象 Core の GitHub owner/repository。
- `STEWARD_REF`: 統合対象 Core の完全な 40 桁 commit SHA。

未設定・SHA 形式不正なら公開を止めます。Core が非公開の場合は、checkout 用の認証にも対象 repository の読取権限が必要です。現在の `GITHUB_TOKEN` で読めなければ checkout が失敗し、公開されません。

通常の PR CI では Core 接続は任意です。未設定なら Community 単体の E2E だけを実施し、Core 連携済みという証拠にはしません。設定時は明示した checkout の protocol mirror を参照します。

同期は Core の既存 export をコピーします。readiness・SLA・operators・wire-node・mail API の必須ファイルが空または欠落していれば失敗します。Core 側の export 生成は別工程で、同期中に実行しません。ローカルの既定参照先は傘リポジトリの `Core/` です。

このゲートは既存の resilience・governance・wire-node・mail-connect E2E を対象とします。実稼働 Core/Community を同時起動した SSO・本番メール配送・顧客の操作完走は別途実証が必要です。workflow 定義の静的検査だけで CI 実行済みとは扱いません。

E2E 前に protocol exports と Community/Core の commit SHA・ファイルハッシュを artifact に収録し、E2E 後の一致を確認して upload します。`protocol-handoff` は別 checkout で download / restore を行う公開なしの検証です。公開ジョブも同じ artifact を検証してから Docker の path context に渡します。artifact の欠落・内容不一致・Community commit の不一致はエラーになります。

`node --test scripts/tests/protocol-artifact.test.mjs` は、別 checkout 相当のディレクトリへの復元、改変、必須ファイル欠落、symlink、commit 不一致を合成データで検査します。ローカル合格は GitHub artifact サービス上の受渡し成功を意味しません。GitHub 上での最終確認には、変更後の同一コミットで e2e と protocol-handoff の両ジョブが成功した run URL を保存します。
