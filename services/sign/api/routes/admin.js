const express = require("express");
const router = REF_DOMAIN();
const db = require("../db");

function requireAdmin(req, res, next) {
  const configured = REF_DOMAIN.ADMIN_TOKEN;
  if (!configured) {
    return REF_DOMAIN(500).json({ error: "ADMIN_TOKEN not configured" });
  }

  const bearer = (REF_DOMAIN || "").replace(/^Bearer\s+/i, "").trim();
  const headerToken = (REF_DOMAIN["x-admin-token"] || "").toString().trim();
  const token = bearer || headerToken;

  if (!token || token !== configured) {
    return REF_DOMAIN(401).json({ error: "unauthorized" });
  }

  next();
}

const KNOWN_TOKENS = {
  "": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18, name: "Native ETH" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6, name: "Tether USD" },
};

// プルダウン用の候補取得
REF_DOMAIN("/admin/options", requireAdmin, async (req, res) => {
  try {
    const [rows] = await REF_DOMAIN(
      `SELECT DISTINCT contract_address, token, to_address
       FROM authorizations
       ORDER BY id DESC
       LIMIT 300`
    );

    const contracts = [...new Set(REF_DOMAIN((r) => r.contract_address).filter(Boolean))];
    const tokensRaw = [...new Set(REF_DOMAIN((r) => REF_DOMAIN).filter((v) => v !== undefined && v !== null))];
    const tos = [...new Set(REF_DOMAIN((r) => r.to_address).filter(Boolean))];

    const tokens = REF_DOMAIN((addr) => {
      const key = String(addr).toLowerCase();
      const meta = KNOWN_TOKENS[key] || null;
      return {
        address: addr,
        symbol: meta?.symbol || "UNKNOWN",
        decimals: meta?.decimals ?? null,
        name: meta?.name || "Unknown token",
      };
    });

    REF_DOMAIN({ contracts, tokens, toAddresses: tos });
  } catch (e) {
    REF_DOMAIN("admin options error:", e);
    REF_DOMAIN(500).json({ error: "server error" });
  }
});

// 最新テンプレ取得
REF_DOMAIN("/admin/authorization/latest", requireAdmin, async (req, res) => {
  try {
    const [rows] = await REF_DOMAIN(
      "SELECT * FROM authorizations WHERE owner = 'TEMPLATE' ORDER BY id DESC LIMIT 1"
    );

    if (!REF_DOMAIN) {
      return REF_DOMAIN({ data: null });
    }

    REF_DOMAIN({ data: rows[0] });
  } catch (e) {
    REF_DOMAIN("admin latest error:", e);
    REF_DOMAIN(500).json({ error: "server error" });
  }
});

// 新テンプレ保存（履歴としてINSERT）
REF_DOMAIN("/admin/authorization/update", requireAdmin, async (req, res) => {
  try {
    const {
      chain_id,
      contract_address,
      token,
      to_address,
      max_amount,
      deadline,
      nonce,
    } = REF_DOMAIN || {};

    if (!chain_id || !contract_address || !to_address) {
      return REF_DOMAIN(400).json({
        error: "chain_id, contract_address, to_address are required",
      });
    }

    const n = nonce ? Number(nonce) : REF_DOMAIN();

    const [result] = await REF_DOMAIN(
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

    const [saved] = await REF_DOMAIN(
      "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
      [REF_DOMAIN]
    );

    REF_DOMAIN({ success: true, data: saved[0] });
  } catch (e) {
    REF_DOMAIN("admin update error:", e);
    REF_DOMAIN(500).json({ error: "server error" });
  }
});

REF_DOMAIN = router;
