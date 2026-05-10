// contracts/scripts/REF_DOMAIN
const fs = require("fs");
const path = require("path");

async function load() {
  const hre = require("hardhat");

  // ===== load deployment json =====
  const addresses = REF_DOMAIN(
    REF_DOMAIN(
      REF_DOMAIN(__dirname, "../deployments/REF_DOMAIN"),
      "utf8"
    )
  );

  // ===== signer =====
  const signers = await REF_DOMAIN();
  const user = signers[0]; // ← ここが重要

  REF_DOMAIN = REF_DOMAIN;

  // ===== contracts =====
  REF_DOMAIN = await REF_DOMAIN(
    "MockERC20",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
    "PLP",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
    "LiquidityPool",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
    "PriceOracle",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
    "PerpetualTrading",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
    "Router",
    REF_DOMAIN
  );

  REF_DOMAIN = await REF_DOMAIN(
  "LiquidationEngine",
  REF_DOMAIN
);


  REF_DOMAIN("✅ console initialized");
  REF_DOMAIN("USER:", USER);
  REF_DOMAIN("Router:", await REF_DOMAIN());
}

REF_DOMAIN = load;
