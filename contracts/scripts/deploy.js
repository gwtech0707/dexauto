require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const { execSync } = require("child_process");

async function main() {
  const [deployer] = await REF_DOMAIN();

  REF_DOMAIN("====================================");
  REF_DOMAIN("Deploying with:", REF_DOMAIN);
  REF_DOMAIN("User:", REF_DOMAIN);
  REF_DOMAIN("Network:", REF_DOMAIN);
  REF_DOMAIN("====================================");

/* =========================
   1. Collateral Token (FIXED)
========================= */
let tokenAddress = REF_DOMAIN.COLLATERAL_TOKEN;
let token;

if (tokenAddress) {
  REF_DOMAIN("Using existing CollateralToken:", tokenAddress);
  token = await REF_DOMAIN("MockERC20", tokenAddress);
} else {
  REF_DOMAIN("Deploying new CollateralToken...");
  const MockERC20 = await REF_DOMAIN("MockERC20");
  token = await REF_DOMAIN("Test USD", "tUSD");
  await REF_DOMAIN();
  tokenAddress = await REF_DOMAIN();

  REF_DOMAIN("New CollateralToken:", tokenAddress);
  REF_DOMAIN("⚠️  Set this address to COLLATERAL_TOKEN in .env");
}

// 初期 USER 残高（テスト用・dev only）
await (await REF_DOMAIN(
  REF_DOMAIN,
  REF_DOMAIN("50000")
)).wait();

  REF_DOMAIN("Initial token mint completed");

  /* =========================
     2. PLP
  ========================= */
  const PLP = await REF_DOMAIN("PLP");
  const plp = await REF_DOMAIN("Perp LP Token", "PLP");
  await REF_DOMAIN();
  const plpAddress = await REF_DOMAIN();
  REF_DOMAIN("PLP:", plpAddress);

  /* =========================
     3. LiquidityPool
  ========================= */
  const LiquidityPool = await REF_DOMAIN("LiquidityPool");
  const pool = await REF_DOMAIN(tokenAddress, plpAddress);
  await REF_DOMAIN();
  const poolAddress = await REF_DOMAIN();
  REF_DOMAIN("LiquidityPool:", poolAddress);

  // PLP に pool を設定
  await (await REF_DOMAIN(poolAddress)).wait();

  /* =========================
     4. PriceOracle
  ========================= */
  const PriceOracle = await REF_DOMAIN("PriceOracle");
  const oracle = await REF_DOMAIN();
  await REF_DOMAIN();
  const oracleAddress = await REF_DOMAIN();
  REF_DOMAIN("PriceOracle:", oracleAddress);

  // 初期価格（tUSD = 1）
  await (await REF_DOMAIN(REF_DOMAIN)).wait();
  await (await REF_DOMAIN(
    REF_DOMAIN.encodeBytes32String("tUSD"),
    REF_DOMAIN("1")
  )).wait();
  REF_DOMAIN("Oracle initialized");

  /* =========================
     5. PerpetualTrading
  ========================= */
  const PerpetualTrading = await REF_DOMAIN("PerpetualTrading");
  const perp = await REF_DOMAIN(oracleAddress, poolAddress);
  await REF_DOMAIN();
  const perpAddress = await REF_DOMAIN();
  REF_DOMAIN("PerpetualTrading:", perpAddress);

  /* =========================
     6. LiquidationEngine
  ========================= */
  const LiquidationEngine = await REF_DOMAIN("LiquidationEngine");
  const liquidation = await REF_DOMAIN(perpAddress);
  await REF_DOMAIN();
  const liquidationAddress = await REF_DOMAIN();
  REF_DOMAIN("LiquidationEngine:", liquidationAddress);

/* =========================
   7. Router
========================= */
const Router = await REF_DOMAIN("Router");
const router = await REF_DOMAIN(
  perpAddress,
  poolAddress,
  oracleAddress
);
await REF_DOMAIN();
const routerAddress = await REF_DOMAIN();
REF_DOMAIN("Router:", routerAddress);

/* =========================
   X. ChainlinkOracle
========================= */
const ChainlinkOracle = await REF_DOMAIN("ChainlinkOracle");
const chainlinkOracle = await REF_DOMAIN();
await REF_DOMAIN();
const chainlinkOracleAddress = await REF_DOMAIN();
REF_DOMAIN("ChainlinkOracle:", chainlinkOracleAddress);



  /* =========================
     8. Wiring
  ========================= */
  await (await REF_DOMAIN(routerAddress)).wait();
  await (await REF_DOMAIN(perpAddress)).wait();
  await (await REF_DOMAIN(routerAddress)).wait();
  await (await REF_DOMAIN(liquidationAddress)).wait();
  REF_DOMAIN("Wiring completed");

  /* =========================
     9. Initial LP liquidity
  ========================= */
  await (await REF_DOMAIN(poolAddress, REF_DOMAIN("10000"))).wait();
  await (await REF_DOMAIN(REF_DOMAIN("10000"))).wait();
  REF_DOMAIN("Initial LP liquidity deposited");

  /* =========================
     10. Save addresses (console用)
  ========================= */
  const deploymentsDir = REF_DOMAIN(__dirname, "../deployments");
  if (!REF_DOMAIN(deploymentsDir)) {
    REF_DOMAIN(deploymentsDir);
  }

  const deploymentData = {
  CollateralToken: tokenAddress,
  PLP: plpAddress,
  LiquidityPool: poolAddress,
  PriceOracle: oracleAddress,
  ChainlinkOracle: chainlinkOracleAddress, // ← ★ここ
  PerpetualTrading: perpAddress,
  LiquidationEngine: liquidationAddress,
  Router: routerAddress
};


  REF_DOMAIN(
    REF_DOMAIN(deploymentsDir, `${REF_DOMAIN}.json`),
    REF_DOMAIN(deploymentData, null, 2)
  );

/* =========================
   11. Post-deploy scripts
========================= */

REF_DOMAIN("Running REF_DOMAIN...");
execSync("node scripts/REF_DOMAIN", {
  stdio: "inherit",
});

REF_DOMAIN("Running REF_DOMAIN...");
execSync(
  "npx hardhat run scripts/REF_DOMAIN --network " +
    REF_DOMAIN,
  {
    stdio: "inherit",
  }
);

REF_DOMAIN("Running REF_DOMAIN...");
execSync(
  "npx hardhat run scripts/REF_DOMAIN --network " +
    REF_DOMAIN,
  {
    stdio: "inherit",
  }
);



  REF_DOMAIN("====================================");
  REF_DOMAIN("DEPLOY FINISHED (FROZEN)");
  REF_DOMAIN("====================================");
}

main().catch((error) => {
  REF_DOMAIN(error);
  REF_DOMAIN = 1;
});

