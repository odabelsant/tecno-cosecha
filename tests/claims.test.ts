import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { QuotesService } from "@/modules/orders/quotes";
import { OrdersService } from "@/modules/orders/orders";
import { TrustAndClaimsService } from "@/modules/claims/service";

describe("Reputación, Incidencias y Disputas (Fase 12)", () => {
  let db: Database.Database;
  let quotesService: QuotesService;
  let ordersService: OrdersService;
  let claimsService: TrustAndClaimsService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    quotesService = new QuotesService(db);
    ordersService = new OrdersService(db);
    claimsService = new TrustAndClaimsService(db);

    // Sembrar usuarios
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_b12', 'buyer@hotel.do', '8095556060', 'h1', 'BUYER_BUSINESS'),
        ('u_f12', 'farmer@bani.do', '8095557070', 'h2', 'FARMER'),
        ('u_admin12', 'admin@tecnocosecha.do', '8095558080', 'h3', 'ADMIN')
    `).run();

    // Sembrar publicación
    db.prepare(`
      INSERT INTO marketplace_posts (
        id, user_id, post_type, category_id, title, unit, quantity,
        price_per_unit, target_date, province, municipality, status
      ) VALUES (
        'post_mango', 'u_f12', 'OFERTA', 'cat_frutas', 'Mango Banilejo Dulce',
        'CAJA', 100, 600.0, '2026-10-30', 'Peravia', 'Baní', 'ACTIVA'
      )
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("debe permitir calificar solo pedidos completados y evitar reseñas duplicadas", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    quotesService.createQuote(
      {
        id: "q_rev",
        post_id: "post_mango",
        seller_id: "u_f12",
        quantity: 10,
        unit: "CAJA",
        price_per_unit: 600.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Boca Chica",
        target_date: "2026-10-30",
        expires_at: futureDate,
      },
      "u_b12"
    );
    quotesService.acceptQuote("q_rev", "u_f12");
    const order = ordersService.createOrderFromQuote("q_rev", "u_b12");

    // Intento de calificar pedido aún en CONFIRMADO falla
    expect(() => {
      claimsService.submitReview(order.id, "u_b12", 5, "Excelente");
    }).toThrow(/Solo se pueden calificar pedidos que hayan sido formalmente completados/);

    // Avanzar pedido hasta ENTREGADO
    ordersService.transitionOrderStatus(order.id, "EN_PREPARACION", "u_f12");
    ordersService.transitionOrderStatus(order.id, "EN_CAMINO", "u_f12");
    ordersService.transitionOrderStatus(order.id, "ENTREGADO", "u_b12");

    // Calificar exitosamente
    const review = claimsService.submitReview(
      order.id,
      "u_b12",
      5,
      "Mangos de primera calidad, dulces y en su punto exacto"
    );
    expect(review).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.reviewee_id).toBe("u_f12");

    // Intento de emitir una SEGUNDA reseña para el mismo pedido falla (regla anti-duplicados)
    expect(() => {
      claimsService.submitReview(order.id, "u_b12", 4, "Otra reseña duplicada");
    }).toThrow(/Acción denegada: Ya has calificado este pedido previamente/);
  });

  it("debe registrar una incidencia y permitir su resolución humana por un administrador", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    quotesService.createQuote(
      {
        id: "q_inc",
        post_id: "post_mango",
        seller_id: "u_f12",
        quantity: 25,
        unit: "CAJA",
        price_per_unit: 580.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Hotel Playa",
        target_date: "2026-10-30",
        expires_at: futureDate,
      },
      "u_b12"
    );
    quotesService.acceptQuote("q_inc", "u_f12");
    const order = ordersService.createOrderFromQuote("q_inc", "u_b12");
    ordersService.transitionOrderStatus(order.id, "EN_PREPARACION", "u_f12");
    ordersService.transitionOrderStatus(order.id, "EN_CAMINO", "u_f12");
    ordersService.transitionOrderStatus(order.id, "ENTREGADO", "u_b12", {
      notes: "Se recibieron solo 20 cajas de 25 pactadas",
      receivedQuantity: 20,
    });

    // Comprador abre incidencia por diferencia de cantidad
    const incident = claimsService.openIncident(
      order.id,
      "u_b12",
      "DIFERENCIA_PESO_CANTIDAD",
      "Faltaron 5 cajas en el camión al momento de la entrega en recepción.",
      "https://evidencia.test/recibo-firmado.jpg"
    );

    expect(incident).toBeDefined();
    expect(incident.status).toBe("ABIERTA");
    expect(incident.reason).toBe("DIFERENCIA_PESO_CANTIDAD");

    // Un usuario no administrador NO puede resolver la incidencia
    expect(() => {
      claimsService.resolveIncident(
        incident.id,
        "u_f12",
        "FARMER",
        "RESUELTA",
        "Yo le pagué la diferencia"
      );
    }).toThrow(/No autorizado: Solo un administrador/);

    // Administrador media y resuelve humanamente con registro de trazabilidad
    const resolved = claimsService.resolveIncident(
      incident.id,
      "u_admin12",
      "ADMIN",
      "RESUELTA",
      "Mediación completada: Vendedor acordó descontar las 5 cajas del pago final en efectivo."
    );

    expect(resolved.status).toBe("RESUELTA");
    expect(resolved.resolved_by).toBe("u_admin12");
    expect(resolved.resolution_notes).toContain("Mediación completada");
    expect(resolved.resolved_at).toBeDefined();
  });
});
