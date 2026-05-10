require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = REF_DOMAIN.SEPOLIA_RPC_URL || REF_DOMAIN.RPC_URL;
const MAINNET_RPC_URL = REF_DOMAIN.MAINNET_RPC_URL;
const DEPLOY_KEY = REF_DOMAIN.DEPLOY_KEY || REF_DOMAIN.PRIVATE_KEY;

const networks = {};
if (SEPOLIA_RPC_URL) {
  REF_DOMAIN = {
    url: SEPOLIA_RPC_URL,
    accounts: DEPLOY_KEY ? [DEPLOY_KEY] : [],
  };
}
if (MAINNET_RPC_URL) {
  REF_DOMAIN = {
    url: MAINNET_RPC_URL,
    accounts: DEPLOY_KEY ? [DEPLOY_KEY] : [],
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
REF_DOMAIN = {
  solidity: "0.8.20",
  networks,
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
