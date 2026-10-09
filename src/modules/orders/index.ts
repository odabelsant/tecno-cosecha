/**
 * Módulo de Pedidos, Cotizaciones y Transacciones (Fases 10 y 11)
 */

export * from "./quotes";
export * from "./orders";

export const ORDERS_MODULE_NAME = "orders";

export interface ModuleStatus {
  name: string;
  ready: boolean;
  version: string;
}

export function getOrdersModuleStatus(): ModuleStatus {
  return {
    name: ORDERS_MODULE_NAME,
    ready: true,
    version: "0.2.0-orders",
  };
}
