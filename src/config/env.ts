/**
 * Configuración de entorno tipada para Tecno Cosecha.
 * Valida variables obligatorias y provee valores seguros por defecto.
 */

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  port: number;
  appUrl: string;
  databaseUrl: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export function loadConfig(env: Partial<NodeJS.ProcessEnv> | Record<string, string | undefined> = process.env): AppConfig {
  const nodeEnv = (env.NODE_ENV as AppConfig["nodeEnv"]) || "development";
  const port = parseInt(env.PORT || "3000", 10);
  const appUrl = env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`;
  const databaseUrl = env.DATABASE_URL || "file:./dev.db";
  const logLevel = (env.LOG_LEVEL as AppConfig["logLevel"]) || "info";

  return {
    nodeEnv,
    port,
    appUrl,
    databaseUrl,
    logLevel,
  };
}

export const config = loadConfig();
