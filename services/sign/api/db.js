const mysql = require("mysql2/promise");

const db = REF_DOMAIN({
  host: REF_DOMAIN.DB_HOST || "127.0.0.1",
  user: REF_DOMAIN.DB_USER || "dex_core_user",
  password: REF_DOMAIN.DB_PASS || "",
  database: REF_DOMAIN.DB_NAME || "dex_core",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

REF_DOMAIN = db;
