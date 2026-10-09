/**
 * Módulo de Ayuda al Usuario, Preguntas Frecuentes y Tutoriales (Fase 14)
 */

export * from "./service";

export const HELP_MODULE_NAME = "help";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getHelpModuleStatus(): ModuleStatus {
  return {
    name: HELP_MODULE_NAME,
    ready: true,
    version: "0.1.0-help",
  };
}
