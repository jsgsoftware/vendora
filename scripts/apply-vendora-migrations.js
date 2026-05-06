// scripts/apply-vendora-migrations.js
// ============================================================
// Execute Vendora SQL migrations against the local PostgreSQL
// container AFTER InsForge has finished its own migrations.
// ============================================================

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  });
}
loadEnv();

const {
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "postgres",
  POSTGRES_DB = "insforge",
} = process.env;

const sqlDir = path.join(process.cwd(), "docker-init", "db");
const files = fs
  .readdirSync(sqlDir)
  .filter((f) => f.endsWith(".sql"))
  .filter((f) => f.startsWith("vendora-"))
  .sort();

if (files.length === 0) {
  console.log("No vendora-*.sql migrations found. Skipping.");
  process.exit(0);
}

for (const file of files) {
  const fullPath = path.join(sqlDir, file);
  console.log(`Applying ${file}...`);

  const result = spawnSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      POSTGRES_USER,
      "-d",
      POSTGRES_DB,
      "-f",
      `-`,
    ],
    {
      input: fs.readFileSync(fullPath, "utf8"),
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    }
  );

  if (result.status !== 0) {
    console.error(`Failed applying ${file}`);
    process.exit(result.status || 1);
  }
}

console.log("All Vendora migrations applied successfully.");
