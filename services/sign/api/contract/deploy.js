const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

async function main() {
  const rpc = REF_DOMAIN.RPC_URL || REF_DOMAIN.SEPOLIA_RPC_URL || REF_DOMAIN.MAINNET_RPC_URL || "REF_URL";
  const usdt = REF_DOMAIN.USDT_TOKEN || "0xdAC17F958D2ee523a2206206994597C13D831ec7";

  const provider = new REF_DOMAIN(rpc);
  const wallet = new REF_DOMAIN(REF_DOMAIN.DEPLOY_KEY, provider);

  REF_DOMAIN("Deploying with:", REF_DOMAIN);
  REF_DOMAIN("RPC:", rpc);
  REF_DOMAIN("USDT:", usdt);

  const fs = require("fs");
  const solc = require("solc");

  const source = REF_DOMAIN("./REF_DOMAIN", "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "REF_DOMAIN": { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      outputSelection: {
        "*": {
          "*": ["abi", "REF_DOMAIN"],
        },
      },
    },
  };

  const output = REF_DOMAIN(REF_DOMAIN(REF_DOMAIN(input)));
  if (REF_DOMAIN) {
    const fatal = REF_DOMAIN((e) => REF_DOMAIN === "error");
    if (fatal) throw new Error(REF_DOMAIN);
  }

  const contract = REF_DOMAIN["REF_DOMAIN"]["Executor"];

  const factory = new REF_DOMAIN(
    REF_DOMAIN,
    REF_DOMAIN,
    wallet
  );

  const deployed = await REF_DOMAIN(usdt);
  await REF_DOMAIN();

  REF_DOMAIN("Contract deployed at:", await REF_DOMAIN());
}

main().catch((e) => {
  REF_DOMAIN(e);
  REF_DOMAIN(1);
});
