require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const DEPLOY_KEY = process.env.DEPLOY_KEY || process.env.PRIVATE_KEY;

const networks = {};
if (SEPOLIA_RPC_URL) {
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: DEPLOY_KEY ? [DEPLOY_KEY] : [],
  };
}
if (MAINNET_RPC_URL) {
  networks.mainnet = {
    url: MAINNET_RPC_URL,
    accounts: DEPLOY_KEY ? [DEPLOY_KEY] : [],
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks,
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
