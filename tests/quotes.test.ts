import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { QuotesService } from "@/modules/orders/quotes";

describe("Solicitudes, Cotizaciones y Negociación (Fase 10)", () => {
  let db: Database.Database;
  let service: QuotesService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    service = new QuotesService(db);

    // Sembrar usuarios y publicación
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_buyer', 'comprador@rest.do', '8095551010', 'h1', 'BUYER_BUSINESS'),
        ('u_farmer', 'productor@finca.do', '8095552020', 'h2', 'FARMER')
    `).run();

    db.prepare(`
      INSERT INTO marketplace_posts (
        id, user_id, post_type, category_id, title, unit, quantity,
        price_per_unit, target_date, province, municipality, status
      ) VALUES (
        'post_platano', 'u_farmer', 'OFERTA', 'cat_tuberculos', 'Plátano Macho',
        'CIEN', 100, 850.0, '2026-10-25', 'Barahona', 'Vicente Noble', 'ACTIVA'
      )
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("debe crear una cotización válida con fecha de vencimiento futura", () => {
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 días
    const quote = service.createQuote(
      {
        id: "q1",
        post_id: "post_platano",
        seller_id: "u_farmer",
        quantity: 50,
        unit: "CIEN",
        price_per_unit: 800.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Restaurante El Criollo, Santo Domingo",
        target_date: "2026-10-25",
        expires_at: futureDate,
        notes: "Necesitamos entrega matutina",
      },
      "u_buyer"
    );

    expect(quote).toBeDefined();
    expect(quote.status).toBe("PENDIENTE");
    expect(quote.version).toBe(1);
    expect(quote.proposed_by).toBe("u_buyer");
  });

  it("debe impedir que el creador de la propuesta se autoacepte", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    service.createQuote(
      {
        id: "q_auto",
        post_id: "post_platano",
        seller_id: "u_farmer",
        quantity: 20,
        unit: "CIEN",
        price_per_unit: 820.0,
        delivery_mode: "RETIRO_FINCA",
        delivery_location: "Vicente Noble",
        target_date: "2026-10-25",
        expires_at: futureDate,
      },
      "u_buyer"
    );

    // El comprador no puede autoaceptar su propia solicitud
    expect(() => {
      service.acceptQuote("q_auto", "u_buyer");
    }).toThrow(/No puedes autoaceptar una propuesta que tú mismo redactaste/);
  });

  it("debe permitir a la contraparte aceptar, congelando la propuesta", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    service.createQuote(
      {
        id: "q_accept",
        post_id: "post_platano",
        seller_id: "u_farmer",
        quantity: 30,
        unit: "CIEN",
        price_per_unit: 810.0,
        delivery_mode: "RETIRO_FINCA",
        delivery_location: "Finca Barahona",
        target_date: "2026-10-25",
        expires_at: futureDate,
      },
      "u_buyer"
    );

    // El agricultor acepta la cotización del comprador
    const accepted = service.acceptQuote("q_accept", "u_farmer");
    expect(accepted.status).toBe("ACEPTADA");

    // Una cotización aceptada no puede ser modificada ni alterada por contrapropuesta
    expect(() => {
      service.counterQuote("q_accept", { id: "q_counter_fail", price_per_unit: 850 }, "u_buyer");
    }).toThrow(/No se puede hacer contrapropuesta sobre una cotización ya aceptada/);
  });

  it("debe soportar contrapropuestas versionadas con trazabilidad", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    service.createQuote(
      {
        id: "q_v1",
        post_id: "post_platano",
        seller_id: "u_farmer",
        quantity: 40,
        unit: "CIEN",
        price_per_unit: 750.0, // Comprador ofrece 750
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Distrito Nacional",
        target_date: "2026-10-25",
        expires_at: futureDate,
      },
      "u_buyer"
    );

    // El agricultor responde con contrapropuesta a 800
    const counter = service.counterQuote(
      "q_v1",
      {
        id: "q_v2",
        price_per_unit: 800.0,
        notes: "Mínimo que puedo cubrir con flete incluido",
      },
      "u_farmer"
    );

    expect(counter.version).toBe(2);
    expect(counter.proposed_by).toBe("u_farmer");
    expect(counter.parent_quote_id).toBe("q_v1");

    // La versión 1 quedó registrada como CONTRAPROPUESTA
    const q1 = service.getQuoteById("q_v1");
    expect(q1?.status).toBe("CONTRAPROPUESTA");
  });

  it("debe marcar como VENCIDA una propuesta caducada", () => {
    // Fecha en el pasado
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    db.prepare(`
      INSERT INTO quotes (
        id, post_id, buyer_id, seller_id, proposed_by, quantity, unit,
        price_per_unit, delivery_mode, delivery_location, target_date,
        expires_at, status, version
      ) VALUES (
        'q_expired', 'post_platano', 'u_buyer', 'u_farmer', 'u_buyer', 10,
        'CIEN', 800.0, 'RETIRO_FINCA', 'Finca', '2026-10-01', ?, 'PENDIENTE', 1
      )
    `).run(pastDate);

    const checked = service.getQuoteById("q_expired");
    expect(checked?.status).toBe("VENCIDA");
  });
});
