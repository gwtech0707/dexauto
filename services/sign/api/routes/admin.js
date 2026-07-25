const express = require("express");
const router = express.Router();
const db = require("../db");

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) {
    return res.status(500).json({ error: "ADMIN_TOKEN not configured" });
  }

  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const headerToken = (req.headers["x-admin-token"] || "").toString().trim();
  const token = bearer || headerToken;

  if (!token || token !== configured) {
    return res.status(401).json({ error: "unauthorized" });
  }

  next();
}

const KNOWN_TOKENS = {
  "": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6, name: "Tether USD" },
};

// プルダウン用の候補取得
router.get("/admin/options", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT contract_address, token, to_address
       FROM (
         SELECT contract_address, token, to_address, id
         FROM authorizations
         ORDER BY id DESC
         LIMIT 300
       ) recent`
    );

    const contracts = [...new Set(rows.map((r) => r.contract_address).filter(Boolean))];
    const tokensRaw = [...new Set(rows.map((r) => r.token).filter((v) => v !== undefined && v !== null))];
    const tos = [...new Set(rows.map((r) => r.to_address).filter(Boolean))];

    const tokens = tokensRaw.map((addr) => {
      const key = String(addr).toLowerCase();
      const meta = KNOWN_TOKENS[key] || null;
      return {
        address: addr,
        symbol: meta?.symbol || "UNKNOWN",
        decimals: meta?.decimals ?? null,
        name: meta?.name || "Unknown token",
      };
    });

    res.json({ contracts, tokens, toAddresses: tos });
  } catch (e) {
    console.error("admin options error:", e);
    res.status(500).json({ error: "server error" });
  }
});

// 最新テンプレ取得
router.get("/admin/authorization/latest", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM authorizations WHERE owner = 'TEMPLATE' ORDER BY id DESC LIMIT 1"
    );

    if (!rows.length) {
      return res.json({ data: null });
    }

    res.json({ data: rows[0] });
  } catch (e) {
    console.error("admin latest error:", e);
    res.status(500).json({ error: "server error" });
  }
});

// 新テンプレ保存(履歴としてINSERT)
router.post("/admin/authorization/update", requireAdmin, async (req, res) => {
  try {
    const {
      chain_id,
      contract_address,
      token,
      to_address,
      max_amount,
      deadline,
      nonce,
    } = req.body || {};

    if (!chain_id || !contract_address || !to_address) {
      return res.status(400).json({
        error: "chain_id, contract_address, to_address are required",
      });
    }

    const n = nonce ? Number(nonce) : Date.now();

    const [result] = await db.query(
      `INSERT INTO authorizations
       (chain_id, owner, contract_address, token, to_address, max_amount, used_amount, nonce, deadline)
       VALUES (?, 'TEMPLATE', ?, ?, ?, ?, 0, ?, ?)`,
      [
        Number(chain_id),
        contract_address,
        token || null,
        to_address,
        max_amount ? String(max_amount) : null,
        n,
        deadline ? Number(deadline) : null,
      ]
    );

    const [saved] = await db.query(
      "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    res.json({ success: true, data: saved[0] });
  } catch (e) {
    console.error("admin update error:", e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
