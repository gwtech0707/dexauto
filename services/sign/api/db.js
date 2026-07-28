const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "dex_core_user",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "dex_core",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// プールレベルのエラーを捕捉しないと、接続切れ時にNode.jsが未処理の
// 'error'イベントとしてプロセスごとクラッシュさせてしまうため、ここで受け止める。
// mysql2/promiseのラッパーは'error'イベントを内部プールから転送しない
// (acquire/connection/enqueue/releaseのみ転送)ため、db.pool側で捕捉する。
db.pool.on("error", (err) => {
  console.error("[db] pool error:", err);
});

module.exports = db;
