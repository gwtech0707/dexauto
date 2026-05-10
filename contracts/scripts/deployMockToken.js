const hre = require("hardhat");

async function main() {
  const [deployer] = await REF_DOMAIN();

  REF_DOMAIN("Deploying MockERC20 with:", REF_DOMAIN);
  REF_DOMAIN("Network:", REF_DOMAIN);
  REF_DOMAIN("====================================");

  const MockERC20 = await REF_DOMAIN("MockERC20");

  // テスト用トークン名・シンボル
  const token = await REF_DOMAIN(
    "Test USD",
    "tUSD"
  );

  await REF_DOMAIN();

  const tokenAddress = await REF_DOMAIN();

  REF_DOMAIN("MockERC20 deployed to:", tokenAddress);
  REF_DOMAIN("====================================");
}

main().catch((error) => {
  REF_DOMAIN(error);
  REF_DOMAIN = 1;
});
