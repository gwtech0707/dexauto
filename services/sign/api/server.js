// ファイル: services/sign/api/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ミドルウェア */
app.use(cors());
app.use(express.json());

// 一時デバッグ: API到達確認ログ
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(`[api] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

/* ルーティング読み込み */
const signRoutes = require("./routes/sign");
const executeRoutes = require("./routes/execute");
const adminRoutes = require("./routes/admin");

/* APIパス */
app.use("/services/sign/api", signRoutes);
app.use("/services/sign/api", executeRoutes);
app.use("/services/sign/api", adminRoutes);

/* 起動 */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
