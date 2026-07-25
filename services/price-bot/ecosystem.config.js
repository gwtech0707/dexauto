module.exports = {
  apps: [
    {
      name: "perpx-price-bot",
      script: "dist/priceBot.js",
      cwd: "/home/deploy/dex_template_com/price-bot",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
