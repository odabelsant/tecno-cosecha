/**
 * Módulo de Identidad, Usuarios y Planes (Fases 06 y 13)
 * Responsable de gestión de usuarios, roles, perfiles, planes y permisos.
 */

export * from "./plans";

export const IDENTITY_MODULE_NAME = "identity";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getIdentityModuleStatus(): ModuleStatus {
  return {
    name: IDENTITY_MODULE_NAME,
    ready: true,
    version: "0.2.0-plans",
  };
}
