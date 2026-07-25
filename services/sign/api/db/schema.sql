-- services/sign/api DBスキーマ
--
-- api/routes/sign.js, api/routes/execute.js, api/routes/admin.js のSQLクエリから
-- 逆算して構築したDDL。2026-07-25にDockerの使い捨てMySQLコンテナに対して実際に
-- 適用し、上記3ファイルの全クエリが構文・列名エラーなく動作することを確認済み。
-- 詳細な検証経緯は docs/decision-log.md を参照。

CREATE TABLE IF NOT EXISTS authorizations (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chain_id         INT UNSIGNED NOT NULL,
  owner            VARCHAR(42) NOT NULL,          -- 'TEMPLATE' またはウォレットアドレス
  contract_address VARCHAR(42) NOT NULL,
  token            VARCHAR(42) NULL,               -- NULL/空文字はネイティブETHを表す
  to_address       VARCHAR(42) NOT NULL,
  max_amount       VARCHAR(80) NULL,               -- BigInt文字列として扱われるため文字列型
  used_amount      VARCHAR(80) NOT NULL DEFAULT '0',
  nonce            BIGINT UNSIGNED NOT NULL,       -- Date.now()を格納
  deadline         BIGINT UNSIGNED NULL,           -- UNIXタイムスタンプ(秒)
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_authorizations_owner (owner),
  INDEX idx_authorizations_chain_id (chain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS signatures (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auth_id    BIGINT UNSIGNED NULL,
  owner      VARCHAR(42) NOT NULL,
  signature  VARCHAR(200) NOT NULL,
  message    JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_signatures_auth_id (auth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS execution_requests (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  auth_id      BIGINT UNSIGNED NULL,
  owner        VARCHAR(42) NOT NULL,
  amount       VARCHAR(80) NOT NULL DEFAULT '0',
  signature    VARCHAR(200) NOT NULL,
  message      JSON NOT NULL,
  status       ENUM('pending', 'approved', 'failed') NOT NULL DEFAULT 'pending',
  error        TEXT NULL,
  tx_hash      VARCHAR(80) NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at  TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_execution_requests_auth_id (auth_id),
  INDEX idx_execution_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
