const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying MockERC20 with:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("====================================");

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");

  // テスト用トークン名・シンボル
  const token = await MockERC20.deploy(
    "Test USD",
    "tUSD"
  );

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("MockERC20 deployed to:", tokenAddress);
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
