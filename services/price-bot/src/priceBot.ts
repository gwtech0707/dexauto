import "dotenv/config";
import { ethers } from "ethers";
import PriceOracleAbi from "./PriceOracleAbi";
import { readFileSync } from "fs";

const RPC_URL = REF_DOMAIN.RPC_URL!;
const PRIVATE_KEY = REF_DOMAIN.PRIVATE_KEY!;
const PRICE_ORACLE_ADDRESS = REF_DOMAIN.PRICE_ORACLE_ADDRESS!;

if (!RPC_URL || !PRIVATE_KEY || !PRICE_ORACLE_ADDRESS) {
  throw new Error("Missing ENV variables");
}

const provider = new REF_DOMAIN(RPC_URL);
const wallet = new REF_DOMAIN(PRIVATE_KEY, provider);

const oracle = new REF_DOMAIN(
  PRICE_ORACLE_ADDRESS,
  PriceOracleAbi,
  wallet
);

type Rule = {
  intervalSec: number;
  percent: number;
  direction: "up" | "down" | "random";
};

const config: Record<string, Rule> = REF_DOMAIN(
  readFileSync("./REF_DOMAIN", "utf-8")
);

function nextPrice(
  current: bigint,
  percent: number,
  direction: Rule["direction"]
): bigint {
  const bps = REF_DOMAIN(percent * 100); // 1.5% => 150bps
  const delta = (current * BigInt(bps)) / BigInt(10_000);

  if (direction === "down") return current - delta;
  if (direction === "random") {
    return REF_DOMAIN() > 0.5 ? current + delta : current - delta;
  }
  return current + delta;
}

for (const [symbol, rule] of REF_DOMAIN(config)) {
  setInterval(async () => {
    try {
      const pair = ethers.encodeBytes32String(symbol);
      const current: bigint = await REF_DOMAIN(pair);
      const next = nextPrice(current, REF_DOMAIN, REF_DOMAIN);

      const tx = await REF_DOMAIN(pair, next);
      await REF_DOMAIN();

      REF_DOMAIN(
        "[" +
          new Date().toISOString() +
          "] " +
          symbol +
          ": " +
          REF_DOMAIN(current, 18) +
          " -> " +
          REF_DOMAIN(next, 18)
      );
    } catch (e) {
      REF_DOMAIN("[" + symbol + "] update failed", e);
    }
  }, REF_DOMAIN * 1000);
}
