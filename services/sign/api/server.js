// ファイル: services/sign/api/server.js

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

const SIGN_ROOT = path.join(__dirname, "..");

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

/* 静的ファイル配信(署名ページ・管理画面)
 * api/配下(db.js・routes/・.env等)は配信対象に含めない。
 * vendor/・admin/以外のトップレベルファイルは個別ルートで明示的に配信する。 */
app.use("/services/sign/vendor", express.static(path.join(SIGN_ROOT, "vendor")));
app.use("/services/sign/admin", express.static(path.join(SIGN_ROOT, "admin")));

app.get(["/services/sign/", "/services/sign/index.html"], (req, res) => {
  res.sendFile(path.join(SIGN_ROOT, "index.html"));
});

// ドメイン直下(/)へのアクセスは署名ページへ誘導する
app.get("/", (req, res) => {
  res.redirect("/services/sign/");
});
app.get("/services/sign/style.css", (req, res) => {
  res.sendFile(path.join(SIGN_ROOT, "style.css"));
});
app.get("/services/sign/app.js", (req, res) => {
  res.sendFile(path.join(SIGN_ROOT, "app.js"));
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
const PORT = process.env.PORT || 3200;

app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
