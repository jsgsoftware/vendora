// scripts/seed-vendora.mjs
// ============================================================
// Seed script: creates storage bucket + demo users with bcrypt-hashed passwords
// Depends on 'bcrypt' from local node_modules (already in package.json)
// Run AFTER InsForge is running and vendora-01-schema.sql applied.
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

// -----------------------------------------------------------------
// 1. Load .env
// -----------------------------------------------------------------
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
  ACCESS_API_KEY = "ik_vendora_docker_local_dev_key_1234567890abc",
} = process.env;

// -----------------------------------------------------------------
// 2. Create Storage Bucket "images" via InsForge API
// -----------------------------------------------------------------
async function createStorageBucket() {
  const url = "http://localhost:7130/api/storage/buckets";
  const body = JSON.stringify({ bucketName: "images", isPublic: true });

  console.log("[seed] Creating storage bucket 'images'...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_API_KEY}`,
        apikey: ACCESS_API_KEY,
        "Content-Type": "application/json",
      },
      body,
    });
    if (res.ok || res.status === 409) {
      console.log("[seed] Storage bucket 'images' ready.");
      return true;
    }
    const text = await res.text();
    console.warn(`[seed] Bucket creation status ${res.status}:`, text);
    return res.status === 409; // already exists = OK
  } catch (err) {
    console.error("[seed] Failed to create bucket:", err.message);
    return false;
  }
}

// -----------------------------------------------------------------
// 3. Hash password via bcrypt (dynamically import from node_modules)
// -----------------------------------------------------------------
async function hashPassword(password) {
  const bcryptPath = path.join(process.cwd(), "node_modules", "bcrypt", "bcrypt.js");
  const bcryptUrl = pathToFileURL(bcryptPath).href;
  const bcrypt = await import(bcryptUrl);
  return bcrypt.default?.hash
    ? bcrypt.default.hash(password, 12)
    : bcrypt.hash(password, 12);
}

// -----------------------------------------------------------------
// 4. Exec SQL via docker compose exec postgres psql
// -----------------------------------------------------------------
function execSql(sql) {
  const result = spawnSync(
    "docker",
    ["compose", "exec", "-T", "postgres", "psql", "-U", POSTGRES_USER, "-d", POSTGRES_DB, "-f", `-`],
    { input: sql, stdio: ["pipe", "pipe", "pipe"], shell: true, encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error("[seed] SQL error:", result.stderr || result.stdout);
    throw new Error(`SQL failed: ${result.stderr || "unknown error"}`);
  }
  return result.stdout;
}

// -----------------------------------------------------------------
// 5. Main Seed Flow
// -----------------------------------------------------------------
async function seed() {
  console.log("[seed] Starting Vendora seed...");

  await createStorageBucket();

  // Hash passwords
  const adminPass = await hashPassword("admin123");
  const vendorPass = await hashPassword("vendor123");
  const userPass = await hashPassword("user123");

  const sql = `
-- Demo Users (vendora_ compat table)
INSERT INTO vendora_users (id, data) VALUES
('user_admin', jsonb_build_object(
  'name', 'Admin Demo',
  'email', 'admin@demo.com',
  'password', '${adminPass}',
  'role', 'admin',
  'image', 'https://ui-avatars.com/api/?name=Admin+Demo&background=0D8ABC&color=fff',
  'emailVerified', true,
  'address', ARRAY[
    jsonb_build_object('_id','addr1','firstName','Admin','lastName','User','phone','+1-555-0001','city','New York','zipCode','10001','street','123 Admin St','state','NY','country','US')
  ],
  'whishlist', ARRAY[]::jsonb[],
  'defaultPaymentMethod', 'card',
  'createdAt', NOW()
)),
('user_vendor', jsonb_build_object(
  'name', 'Vendor Demo',
  'email', 'vendor@demo.com',
  'password', '${vendorPass}',
  'role', 'vendor',
  'image', 'https://ui-avatars.com/api/?name=Vendor+Demo&background=28a745&color=fff',
  'emailVerified', true,
  'address', ARRAY[
    jsonb_build_object('_id','addr1','firstName','Vendor','lastName','Demo','phone','+1-555-0002','city','Los Angeles','zipCode','90001','street','456 Vendor Blvd','state','CA','country','US')
  ],
  'whishlist', ARRAY[]::jsonb[],
  'defaultPaymentMethod', '',
  'createdAt', NOW()
)),
('user_customer', jsonb_build_object(
  'name', 'Customer Demo',
  'email', 'user@demo.com',
  'password', '${userPass}',
  'role', 'user',
  'image', 'https://ui-avatars.com/api/?name=Customer+Demo&background=ffc107&color=000',
  'emailVerified', true,
  'address', ARRAY[
    jsonb_build_object('_id','addr1','firstName','Customer','lastName','Demo','phone','+1-555-0003','city','Chicago','zipCode','60601','street','789 Customer Ave','state','IL','country','US')
  ],
  'whishlist', ARRAY[]::jsonb[],
  'defaultPaymentMethod', 'card',
  'createdAt', NOW()
))
ON CONFLICT (id) DO NOTHING;

-- Link vendor user to mv_vendors
-- Update mv_vendor_users to reference our demo vendor
INSERT INTO mv_vendor_users (id, vendor_id, user_id, email, role, status)
VALUES ('vuser_vendor_1', 'vendor_demo_1', 'user_vendor', 'vendor@demo.com', 'owner', 'active')
ON CONFLICT (vendor_id, email) DO NOTHING;
`;

  console.log("[seed] Inserting demo users...");
  execSql(sql);
  console.log("[seed] Demo users inserted successfully.");

  console.log("");
  console.log("============================================================");
  console.log("  VENDORA DEMO DATA READY");
  console.log("============================================================");
  console.log("  Admin     : admin@demo.com     / admin123");
  console.log("  Vendor    : vendor@demo.com    / vendor123");
  console.log("  Customer  : user@demo.com      / user123");
  console.log("============================================================");
}

seed().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
