module.exports = {
  apps: [
    {
      name: "chouiaar-api",
      script: "/var/www/chouiaar/api/dist/index.mjs",
      interpreter: "node",
      interpreter_args: "--enable-source-maps",
      cwd: "/var/www/chouiaar/api",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      env_file: "/var/www/chouiaar/.env.production",
      error_file: "/var/log/chouiaar/error.log",
      out_file: "/var/log/chouiaar/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
