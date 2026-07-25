require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const { execSync } = require("child_process");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with:", deployer.address);
  console.log("User:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("====================================");

/* =========================
   1. Collateral Token (FIXED)
========================= */
let tokenAddress = process.env.COLLATERAL_TOKEN;
let token;

if (tokenAddress) {
  console.log("Using existing CollateralToken:", tokenAddress);
  token = await hre.ethers.getContractAt("MockERC20", tokenAddress);
} else {
  console.log("Deploying new CollateralToken...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  token = await MockERC20.deploy("Test USD", "tUSD");
  await token.waitForDeployment();
  tokenAddress = await token.getAddress();

  console.log("New CollateralToken:", tokenAddress);
  console.log("⚠️  Set this address to COLLATERAL_TOKEN in .env");
}

// 初期 USER 残高（テスト用・dev only）
await (await token.mint(
  deployer.address,
  hre.ethers.parseEther("50000")
)).wait();

  console.log("Initial token mint completed");

  /* =========================
     2. PLP
  ========================= */
  const PLP = await hre.ethers.getContractFactory("PLP");
  const plp = await PLP.deploy("Perp LP Token", "PLP");
  await plp.waitForDeployment();
  const plpAddress = await plp.getAddress();
  console.log("PLP:", plpAddress);

  /* =========================
     3. LiquidityPool
  ========================= */
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const pool = await LiquidityPool.deploy(tokenAddress, plpAddress);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("LiquidityPool:", poolAddress);

  // PLP に pool を設定
  await (await plp.setPool(poolAddress)).wait();

  /* =========================
     4. PriceOracle
  ========================= */
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const oracle = await PriceOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("PriceOracle:", oracleAddress);

  // 初期価格（tUSD = 1）
  await (await oracle.addUpdater(deployer.address)).wait();
  await (await oracle.setPrice(
    hre.ethers.encodeBytes32String("tUSD"),
    hre.ethers.parseEther("1")
  )).wait();
  console.log("Oracle initialized");

  /* =========================
     5. PerpetualTrading
  ========================= */
  const PerpetualTrading = await hre.ethers.getContractFactory("PerpetualTrading");
  const perp = await PerpetualTrading.deploy(oracleAddress, poolAddress);
  await perp.waitForDeployment();
  const perpAddress = await perp.getAddress();
  console.log("PerpetualTrading:", perpAddress);

  /* =========================
     6. LiquidationEngine
  ========================= */
  const LiquidationEngine = await hre.ethers.getContractFactory("LiquidationEngine");
  const liquidation = await LiquidationEngine.deploy(perpAddress);
  await liquidation.waitForDeployment();
  const liquidationAddress = await liquidation.getAddress();
  console.log("LiquidationEngine:", liquidationAddress);

/* =========================
   7. Router
========================= */
const Router = await hre.ethers.getContractFactory("Router");
const router = await Router.deploy(
  perpAddress,
  poolAddress,
  oracleAddress
);
await router.waitForDeployment();
const routerAddress = await router.getAddress();
console.log("Router:", routerAddress);

/* =========================
   X. ChainlinkOracle
========================= */
const ChainlinkOracle = await hre.ethers.getContractFactory("ChainlinkOracle");
const chainlinkOracle = await ChainlinkOracle.deploy();
await chainlinkOracle.waitForDeployment();
const chainlinkOracleAddress = await chainlinkOracle.getAddress();
console.log("ChainlinkOracle:", chainlinkOracleAddress);



  /* =========================
     8. Wiring
  ========================= */
  await (await pool.setRouter(routerAddress)).wait();
  await (await pool.setPerp(perpAddress)).wait();
  await (await perp.setRouter(routerAddress)).wait();
  await (await perp.setLiquidationEngine(liquidationAddress)).wait();
  console.log("Wiring completed");

  /* =========================
     9. Initial LP liquidity
  ========================= */
  await (await token.approve(poolAddress, hre.ethers.parseEther("10000"))).wait();
  await (await pool.lpDeposit(hre.ethers.parseEther("10000"))).wait();
  console.log("Initial LP liquidity deposited");

  /* =========================
     10. Save addresses (console用)
  ========================= */
  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
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


  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

/* =========================
   11. Post-deploy scripts
========================= */

console.log("Running generateAddresses.js...");
execSync("node scripts/generateAddresses.js", {
  stdio: "inherit",
});

console.log("Running initPricesFromBinance.js...");
execSync(
  "npx hardhat run scripts/initPricesFromBinance.js --network " +
    hre.network.name,
  {
    stdio: "inherit",
  }
);

console.log("Running mintUsers.js...");
execSync(
  "npx hardhat run scripts/mintUsers.js --network " +
    hre.network.name,
  {
    stdio: "inherit",
  }
);



  console.log("====================================");
  console.log("DEPLOY FINISHED (FROZEN)");
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

