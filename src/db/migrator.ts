import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { getDatabase } from "./connection";

export interface MigrationRecord {
  id: number;
  version: string;
  name: string;
  applied_at: string;
}

export function runMigrations(db?: Database.Database): string[] {
  const activeDb = db || getDatabase();
  const migrationsDir = path.resolve(process.cwd(), "src/db/migrations");

  // 1. Asegurar tabla de control
  activeDb.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedRows = activeDb
    .prepare("SELECT version FROM schema_migrations")
    .all() as { version: string }[];
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  // 2. Leer archivos de migración ascendentes ordenados
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
    .sort();

  const newlyApplied: string[] = [];

  for (const file of files) {
    const version = file.split("_")[0];
    if (!appliedVersions.has(version)) {
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      // Ejecutar en transacción atómica
      const applyTx = activeDb.transaction(() => {
        activeDb.exec(sqlContent);
        activeDb
          .prepare("INSERT INTO schema_migrations (version, name) VALUES (?, ?)")
          .run(version, file);
      });

      applyTx();
      newlyApplied.push(file);
    }
  }

  return newlyApplied;
}

export function runSeeds(db?: Database.Database, options?: { includeDemo?: boolean }): string[] {
  const activeDb = db || getDatabase();
  const seedsDir = path.resolve(process.cwd(), "src/db/seeds");

  if (!fs.existsSync(seedsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => (options?.includeDemo ? true : !f.includes("demo")))
    .sort();

  const appliedSeeds: string[] = [];

  for (const file of files) {
    const sqlContent = fs.readFileSync(path.join(seedsDir, file), "utf8");
    activeDb.exec(sqlContent);
    appliedSeeds.push(file);
  }

  return appliedSeeds;
}

export function runDemoSeeds(db?: Database.Database): string[] {
  const activeDb = db || getDatabase();
  const seedsDir = path.resolve(process.cwd(), "src/db/seeds");

  if (!fs.existsSync(seedsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith(".sql") && f.includes("demo"))
    .sort();

  const appliedDemoSeeds: string[] = [];

  for (const file of files) {
    const sqlContent = fs.readFileSync(path.join(seedsDir, file), "utf8");
    activeDb.exec(sqlContent);
    appliedDemoSeeds.push(file);
  }

  return appliedDemoSeeds;
}

export function rollbackMigration(db?: Database.Database): string | null {
  const activeDb = db || getDatabase();
  const migrationsDir = path.resolve(process.cwd(), "src/db/migrations");

  const lastMigration = activeDb
    .prepare("SELECT version, name FROM schema_migrations ORDER BY id DESC LIMIT 1")
    .get() as { version: string; name: string } | undefined;

  if (!lastMigration) {
    return null;
  }

  const baseName = lastMigration.name.replace(/\.sql$/, "");
  const downFile = `${baseName}.down.sql`;
  const downPath = path.join(migrationsDir, downFile);

  if (!fs.existsSync(downPath)) {
    throw new Error(`No se encontró el script de reversión: ${downFile}`);
  }

  const sqlContent = fs.readFileSync(downPath, "utf8");

  const rollbackTx = activeDb.transaction(() => {
    activeDb.exec(sqlContent);
    activeDb
      .prepare("DELETE FROM schema_migrations WHERE version = ?")
      .run(lastMigration.version);
  });

  rollbackTx();
  return lastMigration.name;
}
