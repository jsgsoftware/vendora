import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const migrationsDir = path.join(process.cwd(), "insforge", "migrations");

if (!fs.existsSync(migrationsDir)) {
    console.error("Migrations directory not found:", migrationsDir);
    process.exit(1);
}

const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

if (!files.length) {
    console.log("No SQL migrations found in insforge/migrations.");
    process.exit(0);
}

for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    console.log(`Applying ${file}...`);

    const result = spawnSync("npx", ["@insforge/cli", "db", "import", fullPath], {
        stdio: "inherit",
        shell: true,
    });

    if (result.status !== 0) {
        console.error(`Failed applying ${file}`);
        process.exit(result.status || 1);
    }
}

console.log("InsForge DB setup completed.");
