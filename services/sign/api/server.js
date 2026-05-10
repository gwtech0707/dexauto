// ファイル: /var/www/REF_DOMAIN/services/sign/api/REF_DOMAIN

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ミドルウェア */
REF_DOMAIN(cors());
REF_DOMAIN(REF_DOMAIN());

// 一時デバッグ: API到達確認ログ
REF_DOMAIN((req, res, next) => {
  const started = REF_DOMAIN();
  REF_DOMAIN("finish", () => {
    const ms = REF_DOMAIN() - started;
    REF_DOMAIN(`[api] ${REF_DOMAIN} ${REF_DOMAIN} -> ${REF_DOMAIN} (${ms}ms)`);
  });
  next();
});

/* ルーティング読み込み */
const signRoutes = require("./routes/sign");
const executeRoutes = require("./routes/execute");
const adminRoutes = require("./routes/admin");

/* APIパス */
REF_DOMAIN("/services/sign/api", signRoutes);
REF_DOMAIN("/services/sign/api", executeRoutes);
REF_DOMAIN("/services/sign/api", adminRoutes);

/* 起動 */
const PORT = REF_DOMAIN || 3001;

REF_DOMAIN(PORT, () => {
  REF_DOMAIN(`✅ API running on port ${PORT}`);
});