# architecture.md

作成日: 2026-07-25

## 概要

`dexauto`は永続先物（perpetual futures）DEXのコアコンポーネント一式。
`README.md`に記載の通り、公開/移設向けにフロントエンド（perpx-frontend）や
wallet-monitor、デプロイランブック等を除いた最小構成。3つの独立したサブプロジェクトで構成される。

## 構成

```
dexauto/
├── contracts/          # Solidityコントラクト一式（Hardhat）
├── services/
│   ├── price-bot/      # オンチェーン価格更新bot（TypeScript）
│   └── sign/           # EIP-7702署名フロー用フロントエンド + API
└── docs/                # このディレクトリ
```

### contracts/

Hardhat + OpenZeppelin構成。`contracts/contracts/`配下は以下のレイヤーに分かれる。

- `core/Router.sol`: エントリーポイント
- `perpetual/`: `PerpetualTrading.sol`（メインロジック）、`OrderBook.sol`、`FundingRate.sol`
- `liquidity/LiquidityPool.sol`, `tokens/PLP.sol`: LPトークン・流動性プール
- `liquidation/LiquidationEngine.sol`: 清算処理
- `oracle/`: `PriceOracle.sol`, `ChainlinkOracle.sol`
- `libraries/`: `MathLib` / `PositionLib` / `PriceLib` / `FundingLib`（共通計算ロジック）
- `interfaces/`: 各コントラクトのインターフェース定義
- `mocks/MockERC20.sol`: テスト用

25 Solidityファイルで構成、`npx hardhat compile`でコンパイル成功を確認済み（2026-07-25時点、警告のみ・エラーなし）。

### services/price-bot/

`ethers.js`v6ベースのオンチェーン価格更新bot。`src/priceBot.js`（ビルド後 `dist/priceBot.js`）を
`pm2`（`ecosystem.config.js`）で常駐実行する想定。`config.json`で対象ペア等を設定。

### services/sign/

EIP-7702形式のオフチェーン署名→承認→実行フロー。

- `index.html` + `app.js`: エンドユーザー向け署名画面（ウォレット接続・署名・実行リクエスト作成）
- `admin/`: 管理画面（`index.html`/`template.html`/`approvals.html` + 対応するJS）
  - テンプレート（許可条件のひな形）作成・履歴管理
  - 実行リクエストの承認/却下
- `api/`: Express製バックエンド（`server.js`起点）
  - `routes/sign.js`: 署名対象データの発行・署名保存
  - `routes/execute.js`: 実行リクエストの作成・承認・実行
  - `routes/admin.js`: 管理画面向けAPI（テンプレート管理・承認一覧）
  - `db.js`: MySQL（`mysql2/promise`）への接続プール。`authorizations` / `signatures` / `execution_requests`テーブルを使用
  - `contract/Executor.sol` + `contract/deploy.js`: 署名済み実行を代行実行するコントラクトとそのデプロイスクリプト

## 経緯: サニタイズ破損と復元

公開前のリポジトリサニタイズ処理で、`REF_DOMAIN` / `REF_URL`というプレースホルダー文字列への
置換が過剰に行われ、実際のURL・秘密鍵だけでなく`msg.sender`や`req.body`のような基本構文の一部
まで意図せず置換され、コードが壊れた状態でコミットされていた。

司令塔セッションが、関連する別リポジトリ（`Aroon33/main_dex_template`、
`Aroon33/w.dex-template.com`）を参照しながら破損箇所を復元し、2026-07-25にmainブランチへ
push済み（コミット`4ba9fe9`「Fix REF_DOMAIN/REF_URL sanitization corruption across
contracts, price-bot, sign services」）。

このセッション（`dexauto`）は本プロジェクトの以後の開発・保守を担当する。詳細な判断の記録は
[decision-log.md](./decision-log.md)を参照。

## 既知の課題

[decision-log.md](./decision-log.md)の「既知の課題」セクションを参照。
