import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { PublicationsService, DiscoveryService } from "@/modules/publications";

describe("Búsqueda y Filtros de Publicaciones (Fase 09)", () => {
  let db: Database.Database;
  let pubService: PublicationsService;
  let searchService: DiscoveryService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    pubService = new PublicationsService(db);
    searchService = new DiscoveryService(db);

    // Sembrar usuarios
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_f1', 'f1@campo.do', '8095551101', 'h1', 'FARMER'),
        ('u_f2', 'f2@campo.do', '8095551102', 'h2', 'FARMER'),
        ('u_b1', 'b1@campo.do', '8095551103', 'h3', 'BUYER_BUSINESS')
    `).run();

    // Sembrar publicaciones variadas para pruebas de búsqueda
    pubService.createPost(
      {
        id: "p1",
        post_type: "OFERTA",
        category_id: "cat_tuberculos",
        title: "Plátano Macho Barahonero de Primera",
        variety: "Macho",
        unit: "CIEN",
        quantity: 100,
        price_per_unit: 850.0,
        target_date: "2026-10-25",
        province: "Barahona",
        municipality: "Vicente Noble",
        status: "ACTIVA",
      },
      "u_f1"
    );

    pubService.createPost(
      {
        id: "p2",
        post_type: "OFERTA",
        category_id: "cat_tuberculos",
        title: "Yuca Mocana Dulce de Cosecha",
        variety: "Criolla",
        unit: "QQ",
        quantity: 50,
        price_per_unit: 1200.0,
        target_date: "2026-10-30",
        province: "Espaillat",
        municipality: "Moca",
        status: "ACTIVA",
      },
      "u_f1"
    );

    pubService.createPost(
      {
        id: "p3",
        post_type: "OFERTA",
        category_id: "cat_vegetales",
        title: "Tomate Barceló para Ensalada",
        variety: "Barceló",
        unit: "CAJA",
        quantity: 30,
        price_per_unit: 450.0,
        target_date: "2026-10-20",
        province: "Azua",
        municipality: "Pueblo Viejo",
        status: "ACTIVA",
      },
      "u_f2"
    );

    pubService.createPost(
      {
        id: "p4_demanda",
        post_type: "DEMANDA",
        category_id: "cat_tuberculos",
        title: "Compro Plátano Macho para Restaurante",
        unit: "CIEN",
        quantity: 200,
        price_per_unit: 900.0,
        target_date: "2026-10-28",
        province: "Santo Domingo",
        municipality: "Distrito Nacional",
        status: "ACTIVA",
      },
      "u_b1"
    );
  });

  afterEach(() => {
    db.close();
  });

  it("debe filtrar por tipo de publicación (OFERTA vs DEMANDA)", () => {
    const ofertas = searchService.searchPosts({ post_type: "OFERTA" });
    expect(ofertas.totalCount).toBe(3);
    ofertas.items.forEach((item) => expect(item.post_type).toBe("OFERTA"));

    const demandas = searchService.searchPosts({ post_type: "DEMANDA" });
    expect(demandas.totalCount).toBe(1);
    expect(demandas.items[0].id).toBe("p4_demanda");
  });

  it("debe combinar filtros múltiples (categoría + provincia + unidad)", () => {
    const result = searchService.searchPosts({
      category_id: "cat_tuberculos",
      province: "Barahona",
      unit: "CIEN",
    });

    expect(result.totalCount).toBe(1);
    expect(result.items[0].id).toBe("p1");
    expect(result.items[0].title).toContain("Plátano");
  });

  it("debe realizar búsqueda por texto libre (query)", () => {
    const result = searchService.searchPosts({ query: "Mocana" });
    expect(result.totalCount).toBe(1);
    expect(result.items[0].id).toBe("p2");
    expect(result.items[0].title).toContain("Yuca Mocana");
  });

  it("debe filtrar por precio máximo y cantidad mínima", () => {
    // Tomate (450) vs Yuca (1200) vs Plátano (850)
    const baratos = searchService.searchPosts({ max_price: 500 });
    expect(baratos.totalCount).toBe(1);
    expect(baratos.items[0].id).toBe("p3");

    // Cantidad >= 80
    const porVolumen = searchService.searchPosts({ min_quantity: 80 });
    expect(porVolumen.totalCount).toBe(2); // p1 (100) y p4_demanda (200)
  });

  it("debe explicar claramente el estado vacío cuando ningún resultado coincide", () => {
    const sinResultados = searchService.searchPosts({
      province: "Pedernales",
      category_id: "cat_vegetales",
    });

    expect(sinResultados.totalCount).toBe(0);
    expect(sinResultados.items).toHaveLength(0);
    expect(sinResultados.explanation).toContain("No se encontraron publicaciones que coincidan");
  });

  it("debe soportar paginación limpia sin optimizaciones prematuras", () => {
    const page1 = searchService.searchPosts({ limit: 2, page: 1 });
    expect(page1.items).toHaveLength(2);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBe(2);
    expect(page1.hasMore).toBe(true);

    const page2 = searchService.searchPosts({ limit: 2, page: 2 });
    expect(page2.items).toHaveLength(2);
    expect(page2.page).toBe(2);
    expect(page2.hasMore).toBe(false);
  });

  it("debe permitir limpiar filtros a los valores por defecto", () => {
    const defaultFilters = searchService.getDefaultFilters();
    expect(defaultFilters).toEqual({ page: 1, limit: 20 });
    const all = searchService.searchPosts(defaultFilters);
    expect(all.totalCount).toBe(4);
  });
});
