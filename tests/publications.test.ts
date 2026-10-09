import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { PublicationsService } from "@/modules/publications";

describe("Publicaciones y Vistas General/Comprar/Vender (Fase 08)", () => {
  let db: Database.Database;
  let service: PublicationsService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    service = new PublicationsService(db);

    // Sembrar dos usuarios para pruebas
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u_farmer_1', 'campesino@campo.do', '8095551111', 'hash1', 'FARMER')
    `).run();

    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u_buyer_1', 'colmado@ciudad.do', '8095552222', 'hash2', 'BUYER_BUSINESS')
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("debe permitir crear una oferta (Vender) y una demanda (Comprar)", () => {
    // 1. Productor publica OFERTA
    const oferta = service.createPost(
      {
        id: "post_oferta_1",
        post_type: "OFERTA",
        category_id: "cat_tuberculos",
        title: "Plátano Macho Criollo de Primera",
        unit: "CIEN",
        quantity: 50,
        price_per_unit: 800.0,
        target_date: "2026-10-20",
        province: "La Vega",
        municipality: "Cutupú",
        status: "ACTIVA",
      },
      "u_farmer_1"
    );

    expect(oferta).toBeDefined();
    expect(oferta.post_type).toBe("OFERTA");
    expect(oferta.status).toBe("ACTIVA");

    // 2. Comerciante publica DEMANDA (Necesidad de compra)
    const demanda = service.createPost(
      {
        id: "post_demanda_1",
        post_type: "DEMANDA",
        category_id: "cat_vegetales",
        title: "Compro 20 Quintales de Tomate Barceló",
        unit: "QQ",
        quantity: 20,
        price_per_unit: 1400.0,
        target_date: "2026-10-22",
        province: "Santo Domingo",
        municipality: "Distrito Nacional",
        status: "ACTIVA",
      },
      "u_buyer_1"
    );

    expect(demanda).toBeDefined();
    expect(demanda.post_type).toBe("DEMANDA");
    expect(demanda.status).toBe("ACTIVA");
  });

  it("debe aislar y proteger los borradores (BORRADOR) del público", () => {
    service.createPost(
      {
        id: "post_draft_1",
        post_type: "OFERTA",
        category_id: "cat_frutas",
        title: "Borrador de Aguacate",
        unit: "CIEN",
        quantity: 10,
        price_per_unit: 1000.0,
        target_date: "2026-10-30",
        province: "San Cristóbal",
        municipality: "Cambita",
        status: "BORRADOR",
      },
      "u_farmer_1"
    );

    // Visible para el dueño
    const forOwner = service.getPostById("post_draft_1", "u_farmer_1");
    expect(forOwner).not.toBeNull();
    expect(forOwner?.title).toBe("Borrador de Aguacate");

    // Oculto para otro usuario
    const forOther = service.getPostById("post_draft_1", "u_buyer_1");
    expect(forOther).toBeNull();

    // Visible para ADMIN
    const forAdmin = service.getPostById("post_draft_1", "u_admin", "ADMIN");
    expect(forAdmin).not.toBeNull();
  });

  it("debe respetar las reglas de vistas: General, Comprar y Vender", () => {
    // Crear una OFERTA activa
    service.createPost(
      {
        id: "p_of",
        post_type: "OFERTA",
        category_id: "cat_tuberculos",
        title: "Yuca Mocana",
        unit: "QQ",
        quantity: 30,
        price_per_unit: 1200,
        target_date: "2026-10-15",
        province: "Espaillat",
        municipality: "Moca",
        status: "ACTIVA",
      },
      "u_farmer_1"
    );

    // Crear una DEMANDA activa
    service.createPost(
      {
        id: "p_de",
        post_type: "DEMANDA",
        category_id: "cat_vegetales",
        title: "Necesito Cebolla Roja",
        unit: "QQ",
        quantity: 15,
        price_per_unit: 1800,
        target_date: "2026-10-18",
        province: "Santiago",
        municipality: "Santiago",
        status: "ACTIVA",
      },
      "u_buyer_1"
    );

    // 1. Vista COMPRAR: solo muestra OFERTAS (productos que los compradores pueden comprar)
    const comprarView = service.listPostsByView("COMPRAR");
    expect(comprarView).toHaveLength(1);
    expect(comprarView[0].id).toBe("p_of");

    // 2. Vista VENDER: solo muestra DEMANDAS (compradores buscando cosechas para suplir)
    const venderView = service.listPostsByView("VENDER");
    expect(venderView).toHaveLength(1);
    expect(venderView[0].id).toBe("p_de");

    // 3. Vista GENERAL: muestra ambas
    const generalView = service.listPostsByView("GENERAL");
    expect(generalView).toHaveLength(2);
  });

  it("debe validar permisos de dueño al editar o cerrar publicaciones", () => {
    service.createPost(
      {
        id: "p_edit",
        post_type: "OFERTA",
        category_id: "cat_frutas",
        title: "Mango Banilejo",
        unit: "CAJA",
        quantity: 40,
        price_per_unit: 600,
        target_date: "2026-10-25",
        province: "Peravia",
        municipality: "Baní",
        status: "ACTIVA",
      },
      "u_farmer_1"
    );

    // Usuario ajeno no puede editar
    expect(() => {
      service.updatePost("p_edit", { price_per_unit: 500 }, "u_buyer_1");
    }).toThrow(/No autorizado/);

    // El dueño sí puede editar
    const updated = service.updatePost("p_edit", { price_per_unit: 550 }, "u_farmer_1");
    expect(updated.price_per_unit).toBe(550);

    // El dueño puede cerrar la publicación
    const closed = service.closePost("p_edit", "u_farmer_1");
    expect(closed.status).toBe("CERRADA");

    // Publicación cerrada no aparece en la vista COMPRAR
    const viewAfterClose = service.listPostsByView("COMPRAR");
    expect(viewAfterClose).toHaveLength(0);
  });
});
