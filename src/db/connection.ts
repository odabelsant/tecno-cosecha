import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { config } from "@/config/env";

let dbInstance: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  const rawPath = dbPath || config.databaseUrl.replace(/^file:/, "");
  const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);

  // Asegurar que el directorio contenedor exista
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  // Habilitar integridad referencial en SQLite (obligatorio por ADR-003)
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  if (!dbPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
