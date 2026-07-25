const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

async function main() {
  const rpc = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || "";
  const usdt = process.env.USDT_TOKEN || "0xdAC17F958D2ee523a2206206994597C13D831ec7";

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.DEPLOY_KEY, provider);

  console.log("Deploying with:", wallet.address);
  console.log("RPC:", rpc);
  console.log("USDT:", usdt);

  const fs = require("fs");
  const solc = require("solc");

  const source = fs.readFileSync("./Executor.sol", "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "Executor.sol": { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const fatal = output.errors.some((e) => e.severity === "error");
    if (fatal) throw new Error(JSON.stringify(output.errors));
  }

  const contract = output.contracts["Executor.sol"]["Executor"];

  const factory = new ethers.ContractFactory(
    contract.abi,
    contract.evm.bytecode.object,
    wallet
  );

  const deployed = await factory.deploy(usdt);
  await deployed.waitForDeployment();

  console.log("Contract deployed at:", await deployed.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
