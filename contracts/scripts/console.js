// contracts/scripts/console.js
const fs = require("fs");
const path = require("path");

async function load() {
  const hre = require("hardhat");

  // ===== load deployment json =====
  const addresses = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../deployments/sepolia.json"),
      "utf8"
    )
  );

  // ===== signer =====
  const signers = await hre.ethers.getSigners();
  const user = signers[0]; // ← ここが重要

  global.USER = user.address;

  // ===== contracts =====
  global.token = await hre.ethers.getContractAt(
    "MockERC20",
    addresses.CollateralToken
  );

  global.plp = await hre.ethers.getContractAt(
    "PLP",
    addresses.PLP
  );

  global.pool = await hre.ethers.getContractAt(
    "LiquidityPool",
    addresses.LiquidityPool
  );

  global.oracle = await hre.ethers.getContractAt(
    "PriceOracle",
    addresses.PriceOracle
  );

  global.perp = await hre.ethers.getContractAt(
    "PerpetualTrading",
    addresses.PerpetualTrading
  );

  global.router = await hre.ethers.getContractAt(
    "Router",
    addresses.Router
  );

  global.liquidation = await hre.ethers.getContractAt(
  "LiquidationEngine",
  addresses.LiquidationEngine
);


  console.log("✅ console initialized");
  console.log("USER:", USER);
  console.log("Router:", await router.getAddress());
}

module.exports = load;
