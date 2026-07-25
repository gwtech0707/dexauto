// scripts/initPricesFromBinance.js
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
  const oracle = await hre.ethers.getContractAt(
    "PriceOracle",
    require("../deployments/sepolia.json").PriceOracle
  );

  for (const [symbol, binancePair] of Object.entries(PAIRS)) {
    const res = await axios.get(
      "https://api.binance.com/api/v3/ticker/price",
      { params: { symbol: binancePair } }
    );

    const price = res.data.price;

    await oracle.setPrice(
      hre.ethers.encodeBytes32String(symbol),
      hre.ethers.parseEther(price)
    );

    console.log(`Set ${symbol}: ${price}`);
  }
}

main().catch(console.error);
