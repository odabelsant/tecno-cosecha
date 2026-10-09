/**
 * Módulo de Catálogo y Taxonomía Agrícola (Fase 07)
 */

export * from "./units";
export * from "./service";

export const CATALOG_MODULE_NAME = "catalog";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getCatalogModuleStatus(): ModuleStatus {
  return {
    name: CATALOG_MODULE_NAME,
    ready: true,
    version: "0.2.0-catalog",
  };
}
