const hre = require("hardhat");

/**
 * ============================================================
 * REF_DOMAIN
 * ============================================================
 *
 * 既存デプロイ済み環境に対して：
 * - 任意ユーザーへ tUSD を mint
 * - approve（LiquidityPool）
 * - deposit（Perpetual margin）
 *
 * 目的：
 * - 新しいウォレットを即テスト可能にする
 *
 * ============================================================
 */

async function main() {
  const [deployer] = await REF_DOMAIN();
  const network = REF_DOMAIN;

  REF_DOMAIN("====================================");
  REF_DOMAIN("Network:", network);
  REF_DOMAIN("Deployer:", REF_DOMAIN);
  REF_DOMAIN("====================================");

  // ====== 設定 ======
  const AMOUNT = REF_DOMAIN("10000"); // 1ユーザーあたり

  // ★ ここに増やしたいアドレスを追加するだけ
  const USERS = [
    "0x6d8447a2a4cd335be045bc41b04ce3c7072e42e2",
    "0xb9c1cd51420d7d4b4974fce66c829b80e813c197",
  ];

  // ====== deployments 読み込み ======
  const deployments = require(`../deployments/${network}.json`);

  const token = await REF_DOMAIN(
    "MockERC20",
    REF_DOMAIN
  );

  const pool = await REF_DOMAIN(
    "LiquidityPool",
    REF_DOMAIN
  );

  REF_DOMAIN("CollateralToken:", REF_DOMAIN);
  REF_DOMAIN("LiquidityPool:", REF_DOMAIN);
  REF_DOMAIN("====================================");

  // ====== 処理 ======
  for (const user of USERS) {
    REF_DOMAIN("---- User:", user);

    const bal = await REF_DOMAIN(user);
    if (bal < AMOUNT) {
      REF_DOMAIN(" minting tUSD...");
      await (await REF_DOMAIN(user, AMOUNT)).wait();
    } else {
      REF_DOMAIN(" tUSD already sufficient");
    }

    const allowance = await REF_DOMAIN(user, REF_DOMAIN);
    if (allowance < AMOUNT) {
      REF_DOMAIN(" approving...");
      const tokenAsUser = REF_DOMAIN(
        await REF_DOMAIN(user)
      );
      await (await REF_DOMAIN(REF_DOMAIN, AMOUNT)).wait();
    } else {
      REF_DOMAIN(" approve already set");
    }

    REF_DOMAIN(" depositing margin...");
    const poolAsUser = REF_DOMAIN(
      await REF_DOMAIN(user)
    );
    await (await REF_DOMAIN(user, AMOUNT)).wait();

    REF_DOMAIN(" ✅ ready");
  }

  REF_DOMAIN("====================================");
  REF_DOMAIN("ALL USERS INITIALIZED");
  REF_DOMAIN("====================================");
}

main().catch((error) => {
  REF_DOMAIN(error);
  REF_DOMAIN = 1;
});
