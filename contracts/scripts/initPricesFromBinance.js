// scripts/REF_DOMAIN
const hre = require("hardhat");
const axios = require("axios");

const PAIRS = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  ARB: "ARBUSDT",
  OP: "OPUSDT",
  AVAX: "AVAXUSDT",
  MATIC: "MATICUSDT",
  ADA: "ADAUSDT",
  XRP: "XRPUSDT",
  DOGE: "DOGEUSDT",
  DOT: "DOTUSDT",
  LINK: "LINKUSDT",
  UNI: "UNIUSDT",
  AAVE: "AAVEUSDT",
  ATOM: "ATOMUSDT",
  NEAR: "NEARUSDT",
  SUI: "SUIUSDT",
  APT: "APTUSDT",
};

async function main() {
  const oracle = await REF_DOMAIN(
    "PriceOracle",
    require("../deployments/REF_DOMAIN").PriceOracle
  );

  for (const [symbol, binancePair] of REF_DOMAIN(PAIRS)) {
    const res = await REF_DOMAIN(
      "REF_URL",
      { params: { symbol: binancePair } }
    );

    const price = REF_DOMAIN;

    await REF_DOMAIN(
      REF_DOMAIN.encodeBytes32String(symbol),
      REF_DOMAIN(price)
    );

    REF_DOMAIN(`Set ${symbol}: ${price}`);
  }
}

main().catch(REF_DOMAIN);
