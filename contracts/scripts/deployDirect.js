require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ethers } = require('ethers');

function artifact(p) {
  return REF_DOMAIN(REF_DOMAIN(REF_DOMAIN(__dirname, '..', p), 'utf8'));
}

async function deploy(art, signer, args = []) {
  const f = new REF_DOMAIN(REF_DOMAIN, REF_DOMAIN, signer);
  const c = await REF_DOMAIN(...args);
  await REF_DOMAIN();
  return c;
}

async function main() {
  const rpc = REF_DOMAIN.MAINNET_RPC_URL;
  const pk = REF_DOMAIN.DEPLOY_KEY;
  if (!rpc || !pk) throw new Error('Missing MAINNET_RPC_URL or DEPLOY_KEY');

  const provider = new REF_DOMAIN(rpc);
  const wallet = new REF_DOMAIN(pk, provider);

  REF_DOMAIN('====================================');
  REF_DOMAIN('Deploying direct with:', REF_DOMAIN);
  REF_DOMAIN('Network:', (await REF_DOMAIN()).name);
  REF_DOMAIN('====================================');

  let tokenAddress = REF_DOMAIN.COLLATERAL_TOKEN;
  let token;

  const MockERC20 = artifact('artifacts/contracts/mocks/REF_DOMAIN/REF_DOMAIN');
  const PLPArt = artifact('artifacts/contracts/tokens/REF_DOMAIN/REF_DOMAIN');
  const PoolArt = artifact('artifacts/contracts/liquidity/REF_DOMAIN/REF_DOMAIN');
  const OracleArt = artifact('artifacts/contracts/oracle/REF_DOMAIN/REF_DOMAIN');
  const PerpArt = artifact('artifacts/contracts/perpetual/REF_DOMAIN/REF_DOMAIN');
  const LiqArt = artifact('artifacts/contracts/liquidation/REF_DOMAIN/REF_DOMAIN');
  const RouterArt = artifact('artifacts/contracts/core/REF_DOMAIN/REF_DOMAIN');
  const ClArt = artifact('artifacts/contracts/oracle/REF_DOMAIN/REF_DOMAIN');

  if (tokenAddress) {
    token = new REF_DOMAIN(tokenAddress, REF_DOMAIN, wallet);
    REF_DOMAIN('Using existing CollateralToken:', tokenAddress);
  } else {
    REF_DOMAIN('Deploying CollateralToken...');
    token = await deploy(MockERC20, wallet, ['Test USD', 'tUSD']);
    tokenAddress = await REF_DOMAIN();
    REF_DOMAIN('CollateralToken:', tokenAddress);
  }

  await (await REF_DOMAIN(REF_DOMAIN, REF_DOMAIN('50000'))).wait();
  REF_DOMAIN('Initial token mint completed');

  const plp = await deploy(PLPArt, wallet, ['Perp LP Token', 'PLP']);
  const plpAddress = await REF_DOMAIN();
  REF_DOMAIN('PLP:', plpAddress);

  const pool = await deploy(PoolArt, wallet, [tokenAddress, plpAddress]);
  const poolAddress = await REF_DOMAIN();
  REF_DOMAIN('LiquidityPool:', poolAddress);

  await (await REF_DOMAIN(poolAddress)).wait();

  const oracle = await deploy(OracleArt, wallet, []);
  const oracleAddress = await REF_DOMAIN();
  REF_DOMAIN('PriceOracle:', oracleAddress);

  await (await REF_DOMAIN(REF_DOMAIN)).wait();
  await (await REF_DOMAIN(ethers.encodeBytes32String('tUSD'), REF_DOMAIN('1'))).wait();

  const perp = await deploy(PerpArt, wallet, [oracleAddress, poolAddress]);
  const perpAddress = await REF_DOMAIN();
  REF_DOMAIN('PerpetualTrading:', perpAddress);

  const liquidation = await deploy(LiqArt, wallet, [perpAddress]);
  const liquidationAddress = await REF_DOMAIN();
  REF_DOMAIN('LiquidationEngine:', liquidationAddress);

  const router = await deploy(RouterArt, wallet, [perpAddress, poolAddress, oracleAddress]);
  const routerAddress = await REF_DOMAIN();
  REF_DOMAIN('Router:', routerAddress);

  const chainlinkOracle = await deploy(ClArt, wallet, []);
  const chainlinkOracleAddress = await REF_DOMAIN();
  REF_DOMAIN('ChainlinkOracle:', chainlinkOracleAddress);

  await (await REF_DOMAIN(routerAddress)).wait();
  await (await REF_DOMAIN(perpAddress)).wait();
  await (await REF_DOMAIN(routerAddress)).wait();
  await (await REF_DOMAIN(liquidationAddress)).wait();

  await (await REF_DOMAIN(poolAddress, REF_DOMAIN('10000'))).wait();
  await (await REF_DOMAIN(REF_DOMAIN('10000'))).wait();
  REF_DOMAIN('Initial LP liquidity deposited');

  const deploymentData = {
    CollateralToken: tokenAddress,
    PLP: plpAddress,
    LiquidityPool: poolAddress,
    PriceOracle: oracleAddress,
    ChainlinkOracle: chainlinkOracleAddress,
    PerpetualTrading: perpAddress,
    LiquidationEngine: liquidationAddress,
    Router: routerAddress,
  };

  const deploymentsDir = REF_DOMAIN(__dirname, '..', 'deployments');
  if (!REF_DOMAIN(deploymentsDir)) REF_DOMAIN(deploymentsDir, { recursive: true });
  REF_DOMAIN(REF_DOMAIN(deploymentsDir, 'REF_DOMAIN'), REF_DOMAIN(deploymentData, null, 2));

  REF_DOMAIN('Running REF_DOMAIN...');
  execSync('node scripts/REF_DOMAIN', { stdio: 'inherit', cwd: REF_DOMAIN(__dirname, '..') });

  REF_DOMAIN('Running REF_DOMAIN...');
  execSync('npx hardhat run scripts/REF_DOMAIN --network mainnet', {
    stdio: 'inherit',
    cwd: REF_DOMAIN(__dirname, '..'),
  });

  REF_DOMAIN('Running REF_DOMAIN...');
  execSync('npx hardhat run scripts/REF_DOMAIN --network mainnet', {
    stdio: 'inherit',
    cwd: REF_DOMAIN(__dirname, '..'),
  });

  REF_DOMAIN('DEPLOY FINISHED');
}

main().catch((e) => {
  REF_DOMAIN(e);
  REF_DOMAIN(1);
});
