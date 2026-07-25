require("dotenv").config();

const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  const deployments = require(`../deployments/${network}.json`);

  const token = await hre.ethers.getContractAt(
    "MockERC20",
    deployments.CollateralToken
  );

  const AMOUNT = hre.ethers.parseEther("10000");

  const USERS = [
    "0x6d8447a2a4cd335be045bc41b04ce3c7072e42e2",
    "0xb9c1cd51420d7d4b4974fce66c829b80e813c197",
  ];

  for (const user of USERS) {
    console.log("minting to", user);
    await (await token.mint(user, AMOUNT)).wait();
  }

  console.log("DONE");
}

main().catch(console.error);
