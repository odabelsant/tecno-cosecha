import { describe, it, expect } from "vitest";
import { loadConfig } from "@/config/env";

describe("Configuración de Entorno (env.ts)", () => {
  it("debe cargar valores por defecto cuando no se proporcionan variables", () => {
    const config = loadConfig({});
    expect(config.nodeEnv).toBe("development");
    expect(config.port).toBe(3000);
    expect(config.databaseUrl).toBe("file:./dev.db");
    expect(config.logLevel).toBe("info");
  });

  it("debe sobreescribir valores cuando se configuran variables de entorno", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      PORT: "4000",
      DATABASE_URL: "file:./test.db",
      LOG_LEVEL: "debug",
    });
    expect(config.nodeEnv).toBe("test");
    expect(config.port).toBe(4000);
    expect(config.databaseUrl).toBe("file:./test.db");
    expect(config.logLevel).toBe("debug");
  });
});
