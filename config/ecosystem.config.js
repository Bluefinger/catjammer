module.exports = {
  apps: [
    {
      name: "catjammer",
      script: "dist/index.js",
      watch: ["dist"],
      watch_delay: 1000,
      ignore_watch: ["node_modules"],
      restart_delay: 1000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],

  // deploy: {
  //   production: {
  //     user: "SSH_USERNAME",
  //     host: "SSH_HOSTMACHINE",
  //     ref: "origin/master",
  //     repo: "GIT_REPOSITORY",
  //     path: "DESTINATION_PATH",
  //     "pre-deploy-local": "",
  //     "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production",
  //     "pre-setup": "",
  //   },
  // },
};
