const fs = require("fs");

function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const vars = {};
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const idx = trimmed.indexOf("=");
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      vars[key] = val;
    });
    return vars;
  } catch {
    return {};
  }
}

const envVars = loadEnv("/var/www/chouiaar/.env.production");

module.exports = {
  apps: [
    {
      name: "chouiaar-api",
      script: "/var/www/chouiaar/repo/artifacts/api-server/dist/index.mjs",
      interpreter: "node",
      interpreter_args: "--enable-source-maps",
      cwd: "/var/www/chouiaar/repo/artifacts/api-server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        ...envVars,
      },
      error_file: "/var/log/chouiaar/error.log",
      out_file: "/var/log/chouiaar/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
