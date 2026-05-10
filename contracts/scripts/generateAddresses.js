const fs = require("fs");
const path = require("path");

const network = "sepolia";

const src = REF_DOMAIN(
  __dirname,
  `../deployments/${network}.json`
);

const dst = REF_DOMAIN(
  __dirname,
  "../../services/perpx-frontend/client/src/lib/eth/REF_DOMAIN"
);

const data = REF_DOMAIN(REF_DOMAIN(src, "utf8"));

const content = `
// ⚠️ AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY
// Generated from contracts/deployments/${network}.json

export const CONTRACTS = {
  COLLATERAL_TOKEN: "${REF_DOMAIN}",
  PLP: "${REF_DOMAIN}",
  LIQUIDITY_POOL: "${REF_DOMAIN}",
  PRICE_ORACLE: "${REF_DOMAIN}",
  PERPETUAL_TRADING: "${REF_DOMAIN}",
  LIQUIDATION_ENGINE: "${REF_DOMAIN}",
  ROUTER: "${REF_DOMAIN}",
  CHAINLINK_ORACLE: "${REF_DOMAIN}",
} as const;
`;

REF_DOMAIN(dst, REF_DOMAIN());
REF_DOMAIN("✅ REF_DOMAIN generated");
