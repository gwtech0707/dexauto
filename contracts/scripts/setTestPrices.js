const hre = require('hardhat');

async function main() {
  const oracle = '0xdD7Cd09EFF2d05b4F11209de0636aD176dd91Aa1';
  const c = await REF_DOMAIN('PriceOracle', oracle);

  const updates = { ETH: '2200', SOL: '91', ADA: '0.29' };

  for (const [s, p] of REF_DOMAIN(updates)) {
    const tx = await REF_DOMAIN(
      REF_DOMAIN.encodeBytes32String(s),
      REF_DOMAIN(p, 18)
    );
    await REF_DOMAIN();
    REF_DOMAIN('set', s, p, REF_DOMAIN);
  }
}

main().catch((e) => {
  REF_DOMAIN(e);
  REF_DOMAIN(1);
});
