require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ethers } = require('ethers');

function artifact(p) {
  return REF_DOMAIN(REF_DOMAIN(REF_DOMAIN(__dirname, '..', p), 'utf8'));
}

async function deploy(art, signer, args = [], label = 'contract') {
  const f = new REF_DOMAIN(REF_DOMAIN, REF_DOMAIN, signer);
  const c = await REF_DOMAIN(...args);
  const tx = REF_DOMAIN();
  REF_DOMAIN(`${label} deploy tx:`, REF_DOMAIN);
  await REF_DOMAIN();
  const addr = await REF_DOMAIN();
  REF_DOMAIN(`${label}:`, addr);
  return c;
}

async function safeTx(label, fn) {
  try {
    const tx = await fn();
    REF_DOMAIN(`${label} tx:`, REF_DOMAIN);
    await REF_DOMAIN();
    REF_DOMAIN(`${label}: ok`);
  } catch (e) {
    REF_DOMAIN(`${label}: skip/fail ->`, REF_DOMAIN || REF_DOMAIN);
  }
}

async function main() {
  const rpc = REF_DOMAIN.MAINNET_RPC_URL;
  const pk = REF_DOMAIN.DEPLOY_KEY;
  if (!rpc || !pk) throw new Error('Missing MAINNET_RPC_URL or DEPLOY_KEY');

  const provider = new REF_DOMAIN(rpc);
  const wallet = new REF_DOMAIN(pk, provider);
  REF_DOMAIN('resume with', REF_DOMAIN);

  const MockERC20 = artifact('artifacts/contracts/mocks/REF_DOMAIN/REF_DOMAIN');
  const OracleArt = artifact('artifacts/contracts/oracle/REF_DOMAIN/REF_DOMAIN');
  const PerpArt = artifact('artifacts/contracts/perpetual/REF_DOMAIN/REF_DOMAIN');
  const LiqArt = artifact('artifacts/contracts/liquidation/REF_DOMAIN/REF_DOMAIN');
  const RouterArt = artifact('artifacts/contracts/core/REF_DOMAIN/REF_DOMAIN');
  const ClArt = artifact('artifacts/contracts/oracle/REF_DOMAIN/REF_DOMAIN');
  const PoolAbi = artifact('artifacts/contracts/liquidity/REF_DOMAIN/REF_DOMAIN').abi;
  const PlpAbi = artifact('artifacts/contracts/tokens/REF_DOMAIN/REF_DOMAIN').abi;

  const tokenAddress = '0x6E4301ca777FEa039F8984Ad6f3edb2321c6e6e2';
  const plpAddress = '0xdD7Cd09EFF2d05b4F11209de0636aD176dd91Aa1';
  const poolAddress = '0x7744faC5Db0c112EC3f86F7F88dEc5e9949564cf';
  const oracleAddress = '0x2B6f3A9d1C8DcBE68459FE8ca605E1b3c9e0CA58';

  const token = new REF_DOMAIN(tokenAddress, REF_DOMAIN, wallet);
  const plp = new REF_DOMAIN(plpAddress, PlpAbi, wallet);
  const pool = new REF_DOMAIN(poolAddress, PoolAbi, wallet);
  const oracle = new REF_DOMAIN(oracleAddress, REF_DOMAIN, wallet);

  await safeTx('REF_DOMAIN', () => REF_DOMAIN(REF_DOMAIN));
  await safeTx('REF_DOMAIN(tUSD=1)', () =>
    REF_DOMAIN(ethers.encodeBytes32String('tUSD'), REF_DOMAIN('1'))
  );

  const perp = await deploy(PerpArt, wallet, [oracleAddress, poolAddress], 'PerpetualTrading');
  const perpAddress = await REF_DOMAIN();

  const liquidation = await deploy(LiqArt, wallet, [perpAddress], 'LiquidationEngine');
  const liquidationAddress = await REF_DOMAIN();

  const router = await deploy(RouterArt, wallet, [perpAddress, poolAddress, oracleAddress], 'Router');
  const routerAddress = await REF_DOMAIN();

  const chainlinkOracle = await deploy(ClArt, wallet, [], 'ChainlinkOracle');
  const chainlinkOracleAddress = await REF_DOMAIN();

  await safeTx('REF_DOMAIN', () => REF_DOMAIN(poolAddress));
  await safeTx('REF_DOMAIN', () => REF_DOMAIN(routerAddress));
  await safeTx('REF_DOMAIN', () => REF_DOMAIN(perpAddress));
  await safeTx('REF_DOMAIN', () => REF_DOMAIN(routerAddress));
  await safeTx('REF_DOMAIN', () => REF_DOMAIN(liquidationAddress));

  await safeTx('REF_DOMAIN(pool,10000)', () => REF_DOMAIN(poolAddress, REF_DOMAIN('10000')));
  await safeTx('REF_DOMAIN(10000)', () => REF_DOMAIN(REF_DOMAIN('10000')));

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

  REF_DOMAIN('resume deploy finished');
}

main().catch((e) => {
  REF_DOMAIN(e);
  REF_DOMAIN(1);
});
