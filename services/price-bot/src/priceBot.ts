import "dotenv/config";
import { ethers } from "ethers";
import PriceOracleAbi from "./PriceOracleAbi";
import { readFileSync } from "fs";

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const PRICE_ORACLE_ADDRESS = process.env.PRICE_ORACLE_ADDRESS!;

if (!RPC_URL || !PRIVATE_KEY || !PRICE_ORACLE_ADDRESS) {
  throw new Error("Missing ENV variables");
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const oracle = new ethers.Contract(
  PRICE_ORACLE_ADDRESS,
  PriceOracleAbi,
  wallet
);

type Rule = {
  intervalSec: number;
  percent: number;
  direction: "up" | "down" | "random";
};

const config: Record<string, Rule> = JSON.parse(
  readFileSync("./config.json", "utf-8")
);

function nextPrice(
  current: bigint,
  percent: number,
  direction: Rule["direction"]
): bigint {
  const bps = Math.round(percent * 100); // 1.5% => 150bps
  const delta = (current * BigInt(bps)) / BigInt(10_000);

  if (direction === "down") return current - delta;
  if (direction === "random") {
    return Math.random() > 0.5 ? current + delta : current - delta;
  }
  return current + delta;
}

for (const [symbol, rule] of Object.entries(config)) {
  setInterval(async () => {
    try {
      const pair = ethers.encodeBytes32String(symbol);
      const current: bigint = await oracle.getPrice(pair);
      const next = nextPrice(current, rule.percent, rule.direction);

      const tx = await oracle.setPrice(pair, next);
      await tx.wait();

      console.log(
        "[" +
          new Date().toISOString() +
          "] " +
          symbol +
          ": " +
          ethers.formatUnits(current, 18) +
          " -> " +
          ethers.formatUnits(next, 18)
      );
    } catch (e) {
      console.error("[" + symbol + "] update failed", e);
    }
  }, rule.intervalSec * 1000);
}
