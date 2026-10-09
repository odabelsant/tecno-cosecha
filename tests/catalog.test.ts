import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import {
  areUnitsCompatible,
  convertQuantity,
  normalizePriceForComparison,
  CatalogService,
} from "@/modules/catalog";

describe("Catálogo Agrícola y Unidades (Fase 07)", () => {
  describe("1. Conversor y Validador de Unidades del Agro", () => {
    it("debe verificar compatibilidad únicamente entre unidades de la misma familia", () => {
      // Unidades de peso son compatibles
      expect(areUnitsCompatible("QQ", "LB")).toBe(true);
      expect(areUnitsCompatible("LB", "KG")).toBe(true);
      expect(areUnitsCompatible("QQ", "KG")).toBe(true);

      // Unidades de conteo son compatibles
      expect(areUnitsCompatible("CIEN", "UNIDAD")).toBe(true);

      // Unidades de familias incompatibles (peso vs conteo / empaque) NO son compatibles directamente
      expect(areUnitsCompatible("QQ", "CIEN")).toBe(false);
      expect(areUnitsCompatible("LB", "CAJA")).toBe(false);
      expect(areUnitsCompatible("SACO", "UNIDAD")).toBe(false);
    });

    it("debe realizar conversiones matemáticas exactas de cantidades", () => {
      // 1 Quintal = 100 Libras
      expect(convertQuantity(1, "QQ", "LB")).toBe(100);
      // 250 Libras = 2.5 Quintales
      expect(convertQuantity(250, "LB", "QQ")).toBe(2.5);
      // 1 Ciento = 100 Unidades
      expect(convertQuantity(1, "CIEN", "UNIDAD")).toBe(100);
      expect(convertQuantity(50, "UNIDAD", "CIEN")).toBe(0.5);

      // Incompatibles retornan null
      expect(convertQuantity(1, "QQ", "CAJA")).toBeNull();
      expect(convertQuantity(-5, "QQ", "LB")).toBeNull();
    });

    it("debe normalizar precios a unidad estándar para evitar comparaciones engañosas", () => {
      // RD$ 3,000 por quintal (100 lb) = RD$ 30.00 por libra
      const normQQ = normalizePriceForComparison(3000, "QQ");
      expect(normQQ).toEqual({ normalizedPrice: 30, normalizedUnit: "LB" });

      // RD$ 35 por libra = RD$ 35.00 por libra
      const normLB = normalizePriceForComparison(35, "LB");
      expect(normLB).toEqual({ normalizedPrice: 35, normalizedUnit: "LB" });

      // RD$ 800 por ciento de plátanos = RD$ 8.00 por unidad
      const normCien = normalizePriceForComparison(800, "CIEN");
      expect(normCien).toEqual({ normalizedPrice: 8, normalizedUnit: "UNIDAD" });

      // Cajas y sacos no normalizan sin peso/cantidad fija declarada (evita engaño al comprador)
      expect(normalizePriceForComparison(500, "CAJA")).toBeNull();
    });
  });

  describe("2. CRUD Autorizado de Productos de Catálogo", () => {
    let db: Database.Database;
    let service: CatalogService;

    beforeEach(() => {
      db = new Database(":memory:");
      db.pragma("foreign_keys = ON");
      runMigrations(db);
      runSeeds(db);
      service = new CatalogService(db);
    });

    afterEach(() => {
      db.close();
    });

    it("debe listar productos precargados por categoría", () => {
      const tuberculos = service.listProducts("cat_tuberculos");
      expect(tuberculos.length).toBeGreaterThanOrEqual(3);
      const nombres = tuberculos.map((p) => p.name);
      expect(nombres).toContain("Plátano Macho Criollo");
      expect(nombres).toContain("Yuca Mocana");
    });

    it("debe permitir crear producto solo con rol ADMIN", () => {
      // Intento con rol FARMER falla
      expect(() => {
        service.createProduct(
          {
            id: "prod_test_fail",
            category_id: "cat_tuberculos",
            name: "Ñame Americano",
            common_name: "Ñame",
            default_unit: "QQ",
          },
          "FARMER"
        );
      }).toThrow(/No autorizado: Solo administradores/);

      // Con rol ADMIN tiene éxito
      const nuevo = service.createProduct(
        {
          id: "prod_name_blanco",
          category_id: "cat_tuberculos",
          name: "Ñame Blanco Criollo",
          common_name: "Ñame blanco",
          default_unit: "QQ",
          origin_region: "Samaná",
        },
        "ADMIN"
      );

      expect(nuevo).toBeDefined();
      expect(nuevo.name).toBe("Ñame Blanco Criollo");
      expect(nuevo.origin_region).toBe("Samaná");
    });

    it("debe identificar claramente los datos de prueba", () => {
      const testProd = service.getProductById("TEST_PROD_SAMPLE");
      expect(testProd).toBeDefined();
      expect(testProd?.name).toContain("[TEST]");
    });
  });
});
