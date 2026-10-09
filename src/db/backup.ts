import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { getDatabase } from "./connection";

export interface BackupResult {
  success: boolean;
  backupPath: string;
  timestamp: string;
  sizeBytes: number;
}

/**
 * Utilidad de copia de seguridad (backup) segura para SQLite usando la API nativa de respaldo.
 * Cumple con los requerimientos de durabilidad y resiliencia de la Fase 16.
 */
export async function createDatabaseBackup(
  db?: Database.Database,
  targetDir?: string
): Promise<BackupResult> {
  const activeDb = db || getDatabase();
  const destDir = targetDir || path.resolve(process.cwd(), "data/backups");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `tecno-cosecha-backup-${timestamp}.sqlite`;
  const backupFilePath = path.join(destDir, backupFileName);

  // Utilizar backup online seguro sin bloquear lectores
  await activeDb.backup(backupFilePath);

  const stats = fs.statSync(backupFilePath);

  return {
    success: true,
    backupPath: backupFilePath,
    timestamp,
    sizeBytes: stats.size,
  };
}
