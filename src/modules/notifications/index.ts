/**
 * Módulo de Notificaciones Esenciales (Fase 14)
 */

export * from "./service";

export const NOTIFICATIONS_MODULE_NAME = "notifications";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getNotificationsModuleStatus(): ModuleStatus {
  return {
    name: NOTIFICATIONS_MODULE_NAME,
    ready: true,
    version: "0.1.0-notif",
  };
}
