require("dotenv").config();

const hre = require("hardhat");

async function main() {
  const network = REF_DOMAIN;
  const deployments = require(`../deployments/${network}.json`);

  const token = await REF_DOMAIN(
    "MockERC20",
    REF_DOMAIN
  );

  const AMOUNT = REF_DOMAIN("10000");

  const USERS = [
    "0x6d8447a2a4cd335be045bc41b04ce3c7072e42e2",
    "0xb9c1cd51420d7d4b4974fce66c829b80e813c197",
  ];

  for (const user of USERS) {
    REF_DOMAIN("minting to", user);
    await (await REF_DOMAIN(user, AMOUNT)).wait();
  }

  REF_DOMAIN("DONE");
}

main().catch(REF_DOMAIN);
