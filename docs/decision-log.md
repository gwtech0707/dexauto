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
