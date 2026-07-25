# decision-log.md

このファイルは、`dexauto`プロジェクトにおける判断の経緯・既知の課題を時系列で記録する。

---

## 2026-07-25: サニタイズ破損からの復元とmainへのpush

**経緯**: 公開前のリポジトリサニタイズ処理で、`REF_DOMAIN` / `REF_URL`というプレースホルダー
文字列への置換が過剰に行われていた。実際のURL・秘密鍵を隠す目的だったはずが、
`msg.sender`や`req.body`のような基本的な言語構文の一部にまで同じ置換ロジックが適用され、
Solidity/JS/TSのコードが構文レベルで壊れた状態でコミットされていた（コミット`55733df`
「DEX super-core sanitized package」）。

**対応**: 司令塔セッションが、関連する別リポジトリ（`Aroon33/main_dex_template`・
`Aroon33/w.dex-template.com`）のコードを参照しながら破損箇所を文脈から推測して復元し、
2026-07-25にmainブランチへpush（コミット`4ba9fe9`）。

**判断根拠**: 元のプライベートリポジトリの完全なバックアップが手元になかったため、
構造・命名規則が類似する別リポジトリを参照しての推測復元という手段を選択。
完全な正確性は保証されない（詳細は下記「既知の課題」参照）。

---

## 2026-07-25: 初回セットアップ・動作確認

**対応**: `dexauto`セッションが指示書`2026-07-25_初回セットアップ.md`に基づき環境構築を実施。

**確認結果**:
- `contracts/`: `npm install`成功、`npx hardhat compile`で25 Solidityファイルのコンパイル成功
  （警告2件のみ、`perpetual/PerpetualTrading.sol:170`の未使用引数・mutability警告。エラーなし）
- `services/price-bot/`: `npm install`成功、`npx tsc --noEmit`で型エラーなし
- `services/sign/api/`: `npm install`成功、全JSファイル（`db.js`, `server.js`,
  `contract/deploy.js`, `routes/execute.js`, `routes/admin.js`, `routes/sign.js`）で
  `node --check`構文エラーなし、`node server.js`をポート3001で起動しクラッシュなしを確認
  （DB接続は`mysql2`の`createPool`が遅延接続のため、実DBなしでも起動自体は成功する点に注意。
  実クエリ実行時の動作は今回未検証）

**判断根拠**: 指示書の「やらないこと」に従い、`.env`実値設定・実DB/RPC接続確認は今回のスコープ外とした。

---

## 既知の課題（対応は今回不要・把握のみ）

### 1. `services/sign/index.html` の外部CDN URLが空欄

10-12行目:
```html
<!-- TODO: 元は外部CDNのURLでしたが、サニタイズで失われ復元できませんでした。... -->
<script src=""></script>
<script src=""></script>
```

ethers.js（UMD版）とQRコード生成ライブラリ（`canvas#qr`で使用）の読み込み元が、
サニタイズで失われ司令塔セッションも復元できなかった。動作させるには実際のCDN URLの
設定、またはnpmパッケージ化してのバンドルが必要。**現状、`index.html`をブラウザで開いても
署名フロー自体が動作しない状態。**

### 2. `services/sign/admin/main.js` が未読み込み

`admin/`配下の3つのHTML（`index.html`, `template.html`, `approvals.html`）の
`<script>`タグを確認したところ、`template.html`は`template.js`を、`approvals.html`は
`approvals.js`を読み込んでおり、`index.html`はどちらのJSも読み込んでいない。
`main.js`（6734バイト）を参照しているHTMLは1つも見つからなかった。おそらく旧構成の
残骸ファイルで、現在は不要と推測されるが、削除は今回のスコープ外のため未対応。

### 3. `services/sign`内の一部ロジックが推測復元・未検証

司令塔セッションが文脈から推測して復元した箇所として、以下がある。実際に管理画面を
操作しての目視確認はまだ行われていない。

- `services/sign/api/routes/admin.js`, `sign.js`, `execute.js`内のSQL文
  （`authorizations` / `signatures` / `execution_requests`テーブルの列名: 例
  `contract_address`, `token`, `to_address`, `max_amount`, `used_amount`, `chain_id`,
  `deadline`, `nonce`, `owner`, `status`, `tx_hash`, `approved_at`など）
- `services/sign/admin/template.js`, `approvals.js`内のinput要素の値取得・整形ロジック
  （`$("token_addr").value`, `$("max_amount").value`等、フォーム項目とDB列のマッピング）

DBスキーマ定義ファイル（migration等）がリポジトリ内に見当たらず、実際のテーブル定義との
突合ができていない。実DBに接続しての動作確認が必要。

---

## 今後判断が必要な事項

- 上記「既知の課題」への対応要否・優先順位（Akiまたは司令塔セッションの判断待ち）
- `services/sign/admin/main.js`を削除してよいか（未使用の確証はあるが、削除は破壊的操作のため確認要）
- DBスキーマ定義（migration）をリポジトリに含めるか、別管理とするか

---

## 2026-07-25: docsコミットとnpm audit脆弱性対応

**対応**: `dexauto`セッションが指示書`2026-07-25_docsコミットと脆弱性対応.md`に基づき、
`docs/`のコミット（`-c user.name`/`-c user.email`をコミット時のみ一時指定、リポジトリ/
グローバルのgit configは変更せず。コミット`739558a`。pushは未実施）と、3コンポーネントの
`npm audit`調査・対応を実施。

**判断根拠（git identity）**: このマシンにはgit のuser.name/user.emailが未設定だった。
commander運用ルールでgit config自体の永続変更を避けるため、Akiの指示に従い
`git -c user.name=... -c user.email=...`でコミット時のみ一時指定する方式を採用。

### npm audit fix（非force）の適用結果: 実質0件

`contracts/`・`services/sign/api/`双方で`npm audit fix`を実行したが、実行前後で
`package-lock.json`に変更はなく、脆弱性件数も変化しなかった
（contracts: 51件→51件、sign/api: 2件→2件）。

原因: npmが「fixAvailable: true（非major）」と報告していた`tmp`・`ws`は、実際には
親パッケージ側（`solc`が`tmp`を、`@ethersproject/providers`系列が`ws`を）exact指定で
ピン留めしており、semver互換範囲内でのアップグレードが技術的に不可能だった。npm audit
の「非force修正可能」という表示自体が、この種のexact依存ピン留めのケースでは実態と
乖離することがあると判断。`services/price-bot/`は元々0件のため対応不要。

再確認（`npx hardhat compile`, `npx tsc --noEmit`, `node --check`全ファイル +
`node server.js`起動）は、変更が発生しなかったため実質的に前回確認結果のままで
問題なしを再確認。

### `npm audit fix --force`が必要な項目（未適用・要判断のまま一覧化）

| # | 対象 | 現行 | 修正後 | 影響を受ける脆弱性 | 想定される互換性影響 |
|---|---|---|---|---|---|
| 1 | `contracts/` の `@nomicfoundation/hardhat-toolbox` | 3.0.0 | 7.0.0 | high 13件（hardhat-chai-matchers, hardhat-ethers, hardhat-verify, brace-expansion, glob, minimatch, mocha, recursive-readdir, sc-istanbul, serialize-javascript, shelljs, solidity-coverage 等） | メジャー4段階アップ。内部でhardhat-ethers/chai-matchersのAPIが変わる可能性が高い。ただし本リポジトリに`test/`ディレクトリが存在せず、これらのテスト関連devDependencyは現状一切実行されていないため、アップグレード自体の実害は低いと推測されるが未検証 |
| 2 | `contracts/` の `hardhat` | 2.29.0（`^2.22.3`で解決） | 3.11.1系（npm audit上の提案「0.0.7」は無意味な提案でありnpmの探索アルゴリズムが偶然古いバージョンを提示しているだけ） | high 4件（adm-zip, hardhat本体, undici, uuid） | 非常に大きい。Hardhat 3はconfig形式・plugin体系が刷新されており、`hardhat.config.js`の書き換えが必要になる可能性が高い。今回のスコープを大きく超えるため要別途計画 |
| 3 | `services/sign/api/` の `solc` | 0.8.36 | 0.5.0（ダウングレード） | high 1件・low 1件（tmp, solc本体） | **適用不可と判断**。`contract/Executor.sol`は`pragma solidity ^0.8.20;`を要求しており、solc 0.5.0ではコンパイル自体ができず、デプロイスクリプト`contract/deploy.js`が完全に機能しなくなる |

### 対応不要と判断した項目（根拠）

- **`services/sign/api/`のsolc/tmp脆弱性（上表#3）**: `contract/deploy.js`は`server.js`・
  `routes/*.js`のいずれからも`require`されておらず、常時稼働するAPIサーバーの実行時
  攻撃面には含まれない。開発者がローカルで手動実行するデプロイスクリプト専用の依存であり、
  リモートのHTTPリクエスト経由で到達可能な経路は存在しない。また最新のsolc（0.8.36）自体が
  依然として`tmp@0.0.33`を厳密固定しており、solcをどのバージョンに変えても0.5.0まで
  遡らない限りこの問題は解消しない（上流未対応）
- **`contracts/`のhardhat-toolbox系13件（上表#1）**: 現状`test/`ディレクトリが存在せず、
  これらはコンパイル時に読み込まれるだけでテスト・カバレッジ機能自体が実行されていない
  ため、実害は無い。ただし将来テストを追加する際は要再検討
- **`contracts/`のhardhat本体系4件（上表#2）**: 同様にビルド時のみ使用されるCLIツールの
  依存であり、コンパイル成果物（Solidityバイナリ）やprice-bot/sign-apiのランタイムには
  一切含まれない

### 次に判断が必要な事項

- 上表の3項目について、対応する場合の優先順位・実施タイミング（Aki/司令塔の判断待ち）
- 特に#3（solcダウングレード）は機能を壊すため、対応不要のまま様子見が妥当と考えられる
- #1・#2は将来のテスト追加やhardhatメジャーアップのタイミングと合わせて計画するのが現実的
