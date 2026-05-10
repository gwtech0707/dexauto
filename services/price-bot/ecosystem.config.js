REF_DOMAIN = {
  apps: [
    {
      name: "perpx-price-bot",
      script: "dist/REF_DOMAIN",
      cwd: "/home/deploy/dex_template_com/price-bot",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
