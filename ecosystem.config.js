module.exports = {
  apps : [{
    name: "forum-api",
    script: "src/app.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 5000,
    }
  }]
};