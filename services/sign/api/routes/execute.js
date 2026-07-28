const express = require("express");
const router = express.Router();
const db = require("../db");
const { ethers } = require("ethers");

/* RPC */
const RPCS = {
  1: process.env.MAINNET_RPC_URL || "",
  11155111: process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || "",
};

/* ERC20 ABI(最小) */
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

const TOKEN_DECIMALS = Object.fromEntries(
  Object.entries(TOKEN_META).map(([k, v]) => [k, v.decimals])
);

const EXECUTOR_ABI = [
  "function executeUSDTBySig(uint256 chainId,address contractAddress,uint256 nonce,uint256 maxAmount,address to,bytes data,uint256 value,uint256 amount,bytes signature)",
];

const DELEGATE_TOKEN = String(process.env.DELEGATE_TOKEN || process.env.USDT_TOKEN || "0xdAC17F958D2ee523a2206206994597C13D831ec7").toLowerCase();

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

async function loadAndValidateAuthorization({ id, amount, signature, message }) {
  const parsed = typeof message === "string" ? JSON.parse(message) : message;
  if (!parsed?.domain || !parsed?.types || !parsed?.message) {
    throw new Error("invalid typed data");
  }

  const recoveredOwner = ethers.verifyTypedData(
    parsed.domain,
    parsed.types,
    parsed.message,
    signature
  );

  const [rows] = await db.query(
    "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows.length) throw new Error("not found");

  const auth = rows[0];

  if (auth.owner && auth.owner.toLowerCase() !== recoveredOwner.toLowerCase()) {
    throw new Error("owner mismatch");
  }

  if (Number(parsed.message.chainId) !== Number(auth.chain_id)) {
    throw new Error("chain mismatch");
  }
  if ((parsed.message.contractAddress || "").toLowerCase() !== (auth.contract_address || "").toLowerCase()) {
    throw new Error("contract mismatch");
  }
  if ((parsed.message.to || "").toLowerCase() !== (auth.to_address || "").toLowerCase()) {
    throw new Error("to mismatch");
  }
  if (String(parsed.message.nonce) !== String(auth.nonce)) {
    throw new Error("nonce mismatch");
  }

  if (auth.deadline && Number(auth.deadline) < Math.floor(Date.now() / 1000)) {
    throw new Error("expired");
  }

  const rpc = RPCS[auth.chain_id];
  if (!rpc) throw new Error("この環境では実行機能は準備中です(テストネットへのコントラクトデプロイ待ち)");

  return { auth, parsed, recoveredOwner, rpc, amount: String(amount) };
}

async function executeTransfer({ auth, parsed, signature, amount, rpc }) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const tokenKey = String(auth.token || "").toLowerCase();
  const used = BigInt(auth.used_amount || 0);
  const max = BigInt(auth.max_amount || 0);

  // delegate 実行(指定トークン)
  if (tokenKey === DELEGATE_TOKEN) {
    const sendAmount = ethers.parseUnits(String(amount), 6);

    if (max > 0n && used + sendAmount > max) {
      throw new Error("max amount exceeded");
    }

    const msg = parsed.message;
    const exec = new ethers.Contract(auth.contract_address, EXECUTOR_ABI, wallet);
    const sent = await exec.executeUSDTBySig(
      msg.chainId,
      msg.contractAddress,
      msg.nonce,
      msg.maxAmount,
      msg.to,
      msg.data || "0x",
      msg.value || 0,
      sendAmount,
      signature
    );

    let txHash = sent.hash;
    try {
      await sent.wait();
    } catch (err) {
      // ethers v6: replacement/repriced でも receipt.status=1 なら実行成功として扱う
      if (err?.code === "TRANSACTION_REPLACED" && err?.receipt?.status === 1) {
        txHash = err?.replacement?.hash || err?.hash || sent.hash;
      } else {
        throw err;
      }
    }

    await db.query(
      "UPDATE authorizations SET used_amount = ? WHERE id = ?",
      [(used + sendAmount).toString(), auth.id]
    );

    return {
      txHash,
      usedAmount: (used + sendAmount).toString(),
    };
  }

  // 互換: それ以外のトークンは旧方式 transfer
  const contract = new ethers.Contract(auth.token, ERC20_ABI, wallet);
  let decimals = TOKEN_DECIMALS[tokenKey];
  if (decimals === undefined) decimals = await contract.decimals();

  const sendAmount = ethers.parseUnits(String(amount), Number(decimals));
  if (max > 0n && used + sendAmount > max) {
    throw new Error("max amount exceeded");
  }

  const tx = await contract.transfer(auth.to_address, sendAmount);

  let txHash = tx.hash;
  try {
    await tx.wait();
  } catch (err) {
    // ethers v6: replacement/repriced でも receipt.status=1 なら実行成功として扱う
    if (err?.code === "TRANSACTION_REPLACED" && err?.receipt?.status === 1) {
      txHash = err?.replacement?.hash || err?.hash || tx.hash;
    } else {
      throw err;
    }
  }

  await db.query(
    "UPDATE authorizations SET used_amount = ? WHERE id = ?",
    [(used + sendAmount).toString(), auth.id]
  );

  return {
    txHash,
    usedAmount: (used + sendAmount).toString(),
  };
}

/*
 * 実行リクエスト作成(承認待ち)
 */
router.post("/execute", async (req, res) => {
  try {
    const { id, amount, signature, message } = req.body;

    if (!id || !signature || !message) {
      return res.status(400).json({ error: "invalid params" });
    }

    const reqAmount = amount ? String(amount) : "0";
    const validated = await loadAndValidateAuthorization({ id, amount: reqAmount, signature, message });

    const [insert] = await db.query(
      `INSERT INTO execution_requests
       (auth_id, owner, amount, signature, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        validated.recoveredOwner,
        reqAmount,
        signature,
        JSON.stringify(typeof message === "string" ? JSON.parse(message) : message),
      ]
    );

    res.json({
      success: true,
      pending: true,
      requestId: insert.insertId,
      message: "execution request created (pending approval)",
    });
  } catch (err) {
    console.error("execute request error:", err);
    res.json({ success: false, error: err.message });
  }
});

/* 承認待ち一覧(管理用) */
router.get("/execute/pending", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.auth_id, r.owner, r.amount, r.status, r.error, r.tx_hash, r.created_at, r.approved_at,
              a.contract_address, a.max_amount, a.used_amount, a.token, a.chain_id
       FROM execution_requests r
       LEFT JOIN authorizations a ON a.id = r.auth_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC
       LIMIT 100`
    );

    // ガス代支払いウォレット情報(管理画面向け)
    let payerAddress = null;
    let payerEthBalance = null;
    const tokenBalances = {};

    try {
      const firstChain = rows[0]?.chain_id || 1;
      const rpc = RPCS[firstChain] || RPCS[1];
      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const bal = await provider.getBalance(wallet.address);
      payerAddress = wallet.address;
      payerEthBalance = ethers.formatEther(bal);

      const uniqueTokens = [...new Set(rows.map((r) => (r.token || "").toLowerCase()).filter(Boolean))];
      for (const tokenAddr of uniqueTokens) {
        try {
          const c = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          let decimals = TOKEN_META[tokenAddr]?.decimals;
          let symbol = TOKEN_META[tokenAddr]?.symbol;

          if (decimals === undefined) decimals = Number(await c.decimals());
          if (!symbol) symbol = await c.symbol();

          const raw = await c.balanceOf(wallet.address);
          tokenBalances[tokenAddr] = {
            symbol,
            decimals,
            raw: raw.toString(),
            formatted: ethers.formatUnits(raw, Number(decimals)),
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

    const dataWithSymbol = rows.map((r) => {
      const key = (r.token || "").toLowerCase();
      return {
        ...r,
        tokenSymbol: key ? (TOKEN_META[key]?.symbol || tokenBalances[key]?.symbol || "UNKNOWN") : "ETH",
      };
    });

    res.json({
      success: true,
      data: dataWithSymbol,
      meta: {
        payerAddress,
        payerEthBalance,
        tokenBalances,
      },
    });
  } catch (e) {
    console.error("pending list error:", e);
    res.status(500).json({ success: false, error: "server error" });
  }
});

/* 承認実行(管理者) */
router.post("/execute/approve", requireAdmin, async (req, res) => {
  const { requestId, amount } = req.body || {};

  if (!requestId) {
    return res.status(400).json({ success: false, error: "requestId required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM execution_requests WHERE id = ? LIMIT 1",
      [requestId]
    );

    if (!rows.length) {
      return res.json({ success: false, error: "request not found" });
    }

    const reqRow = rows[0];

    if (reqRow.status !== "pending") {
      return res.json({ success: false, error: `already ${reqRow.status}` });
    }

    const approvedAmount = amount ? String(amount) : String(reqRow.amount);

    if (!approvedAmount || Number(approvedAmount) <= 0) {
      return res.json({ success: false, error: "amount must be > 0" });
    }

    const validated = await loadAndValidateAuthorization({
      id: reqRow.auth_id,
      amount: approvedAmount,
      signature: reqRow.signature,
      message: reqRow.message,
    });

    const result = await executeTransfer({
      auth: validated.auth,
      parsed: validated.parsed,
      signature: reqRow.signature,
      amount: approvedAmount,
      rpc: validated.rpc,
    });

    await db.query(
      "UPDATE execution_requests SET status='approved', tx_hash=?, approved_at=NOW() WHERE id=?",
      [result.txHash, requestId]
    );

    await db.query(
      "INSERT INTO signatures (auth_id, owner, signature, message) VALUES (?, ?, ?, ?)",
      [reqRow.auth_id, validated.recoveredOwner, reqRow.signature, reqRow.message]
    );

    res.json({
      success: true,
      requestId,
      approvedAmount,
      txHash: result.txHash,
      usedAmount: result.usedAmount,
      owner: validated.recoveredOwner,
    });
  } catch (err) {
    console.error("approve execute error:", err);

    await db.query(
      "UPDATE execution_requests SET status='failed', error=? WHERE id=?",
      [err.message, requestId]
    );

    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
