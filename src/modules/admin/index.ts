/**
 * Módulo de Administración, Moderación y Auditoría (Fase 15)
 */

export * from "./service";

export const ADMIN_MODULE_NAME = "admin";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getAdminModuleStatus(): ModuleStatus {
  return {
    name: ADMIN_MODULE_NAME,
    ready: true,
    version: "0.1.0-admin",
  };
}
