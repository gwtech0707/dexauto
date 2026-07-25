const hre = require("hardhat");

/**
 * ============================================================
 * addTestUsers.js
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
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("====================================");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("====================================");

  // ====== 設定 ======
  const AMOUNT = hre.ethers.parseEther("10000"); // 1ユーザーあたり

  // ★ ここに増やしたいアドレスを追加するだけ
  const USERS = [
    "0x6d8447a2a4cd335be045bc41b04ce3c7072e42e2",
    "0xb9c1cd51420d7d4b4974fce66c829b80e813c197",
  ];

  // ====== deployments 読み込み ======
  const deployments = require(`../deployments/${network}.json`);

  const token = await hre.ethers.getContractAt(
    "MockERC20",
    deployments.CollateralToken
  );

  const pool = await hre.ethers.getContractAt(
    "LiquidityPool",
    deployments.LiquidityPool
  );

  console.log("CollateralToken:", token.target);
  console.log("LiquidityPool:", pool.target);
  console.log("====================================");

  // ====== 処理 ======
  for (const user of USERS) {
    console.log("---- User:", user);

    const bal = await token.balanceOf(user);
    if (bal < AMOUNT) {
      console.log(" minting tUSD...");
      await (await token.mint(user, AMOUNT)).wait();
    } else {
      console.log(" tUSD already sufficient");
    }

    const allowance = await token.allowance(user, pool.target);
    if (allowance < AMOUNT) {
      console.log(" approving...");
      const tokenAsUser = token.connect(
        await hre.ethers.getSigner(user)
      );
      await (await tokenAsUser.approve(pool.target, AMOUNT)).wait();
    } else {
      console.log(" approve already set");
    }

    console.log(" depositing margin...");
    const poolAsUser = pool.connect(
      await hre.ethers.getSigner(user)
    );
    await (await poolAsUser.deposit(user, AMOUNT)).wait();

    console.log(" ✅ ready");
  }

  console.log("====================================");
  console.log("ALL USERS INITIALIZED");
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
