import { describe, it, expect } from "vitest";
import { getIdentityModuleStatus } from "@/modules/identity";
import { getCatalogModuleStatus } from "@/modules/catalog";
import { getOrdersModuleStatus } from "@/modules/orders";
import { getClaimsModuleStatus } from "@/modules/claims";

describe("Sanity Check de Módulos Modulares (ADR-002)", () => {
  it("el módulo identity debe estar disponible", () => {
    const status = getIdentityModuleStatus();
    expect(status.name).toBe("identity");
    expect(status.ready).toBe(true);
  });

  it("el módulo catalog debe estar disponible", () => {
    const status = getCatalogModuleStatus();
    expect(status.name).toBe("catalog");
    expect(status.ready).toBe(true);
  });

  it("el módulo orders debe estar disponible", () => {
    const status = getOrdersModuleStatus();
    expect(status.name).toBe("orders");
    expect(status.ready).toBe(true);
  });

  it("el módulo claims debe estar disponible", () => {
    const status = getClaimsModuleStatus();
    expect(status.name).toBe("claims");
    expect(status.ready).toBe(true);
  });
});
