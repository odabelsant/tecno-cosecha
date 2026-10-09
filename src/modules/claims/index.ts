/**
 * Módulo de Incidencias, Disputas y Reputación (Fase 12)
 */

export * from "./service";

export const CLAIMS_MODULE_NAME = "claims";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getClaimsModuleStatus(): ModuleStatus {
  return {
    name: CLAIMS_MODULE_NAME,
    ready: true,
    version: "0.2.0-claims",
  };
}
