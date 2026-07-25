const fs = require("fs");
const path = require("path");

const network = "sepolia";

const src = path.resolve(
  __dirname,
  `../deployments/${network}.json`
);

const dst = path.resolve(
  __dirname,
  "../../perpx-frontend/client/src/lib/eth/addresses.ts"
);

const data = JSON.parse(fs.readFileSync(src, "utf8"));

const content = `
// ⚠️ AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY
// Generated from contracts/deployments/${network}.json

export const CONTRACTS = {
  COLLATERAL_TOKEN: "${data.CollateralToken}",
  PLP: "${data.PLP}",
  LIQUIDITY_POOL: "${data.LiquidityPool}",
  PRICE_ORACLE: "${data.PriceOracle}",
  PERPETUAL_TRADING: "${data.PerpetualTrading}",
  LIQUIDATION_ENGINE: "${data.LiquidationEngine}",
  ROUTER: "${data.Router}",
  CHAINLINK_ORACLE: "${data.ChainlinkOracle}",
} as const;
`;

fs.writeFileSync(dst, content.trim());
console.log("✅ addresses.ts generated");
