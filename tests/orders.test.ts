import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { QuotesService } from "@/modules/orders/quotes";
import { OrdersService } from "@/modules/orders/orders";

describe("Pedidos y Cumplimiento de Entrega (Fase 11)", () => {
  let db: Database.Database;
  let quotesService: QuotesService;
  let ordersService: OrdersService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    quotesService = new QuotesService(db);
    ordersService = new OrdersService(db);

    // Sembrar participantes y post
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_buyer_ord', 'restaurante@santo.do', '8095553030', 'h1', 'BUYER_BUSINESS'),
        ('u_farmer_ord', 'agricultor@constanza.do', '8095554040', 'h2', 'FARMER')
    `).run();

    db.prepare(`
      INSERT INTO marketplace_posts (
        id, user_id, post_type, category_id, title, unit, quantity,
        price_per_unit, target_date, province, municipality, status
      ) VALUES (
        'post_tomate', 'u_farmer_ord', 'OFERTA', 'cat_vegetales', 'Tomate Barceló F1',
        'CAJA', 50, 450.0, '2026-10-22', 'La Vega', 'Constanza', 'ACTIVA'
      )
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("debe convertir una cotización ACEPTADA en un pedido con términos confirmados", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    // 1. Crear cotización
    quotesService.createQuote(
      {
        id: "q_ready",
        post_id: "post_tomate",
        seller_id: "u_farmer_ord",
        quantity: 20,
        unit: "CAJA",
        price_per_unit: 420.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Mercado Central, Santo Domingo",
        target_date: "2026-10-22",
        expires_at: futureDate,
      },
      "u_buyer_ord"
    );

    // 2. Agricultor acepta la cotización
    quotesService.acceptQuote("q_ready", "u_farmer_ord");

    // 3. Formalizar pedido
    const order = ordersService.createOrderFromQuote("q_ready", "u_buyer_ord");
    expect(order).toBeDefined();
    expect(order.status).toBe("CONFIRMADO");
    expect(order.quantity).toBe(20);
    expect(order.unit_price).toBe(420.0);
    expect(order.total_price).toBe(8400.0); // 20 * 420
    expect(order.order_number).toMatch(/^TC-ORD-\d{6}$/);

    // 4. Debe tener evento de inicio en el timeline
    const timeline = ordersService.getOrderTimeline(order.id);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].to_status).toBe("CONFIRMADO");
  });

  it("debe rechazar la creación de pedidos desde cotizaciones no aceptadas", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    quotesService.createQuote(
      {
        id: "q_pending",
        post_id: "post_tomate",
        seller_id: "u_farmer_ord",
        quantity: 10,
        unit: "CAJA",
        price_per_unit: 430.0,
        delivery_mode: "RETIRO_FINCA",
        delivery_location: "Finca",
        target_date: "2026-10-22",
        expires_at: futureDate,
      },
      "u_buyer_ord"
    );

    expect(() => {
      ordersService.createOrderFromQuote("q_pending", "u_buyer_ord");
    }).toThrow(/Solo se puede generar un pedido a partir de una cotización ACEPTADA/);
  });

  it("debe ejecutar las transiciones de estado válidas y registrar trazabilidad", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    quotesService.createQuote(
      {
        id: "q_flow",
        post_id: "post_tomate",
        seller_id: "u_farmer_ord",
        quantity: 15,
        unit: "CAJA",
        price_per_unit: 400.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Almacén",
        target_date: "2026-10-22",
        expires_at: futureDate,
      },
      "u_buyer_ord"
    );
    quotesService.acceptQuote("q_flow", "u_farmer_ord");
    const order = ordersService.createOrderFromQuote("q_flow", "u_farmer_ord");

    // 1. Vendedor pasa a EN_PREPARACION
    const prep = ordersService.transitionOrderStatus(order.id, "EN_PREPARACION", "u_farmer_ord", {
      notes: "Cosecha recolectada y empacada en huacales",
    });
    expect(prep.status).toBe("EN_PREPARACION");

    // 2. Vendedor pasa a EN_CAMINO
    const enCamino = ordersService.transitionOrderStatus(order.id, "EN_CAMINO", "u_farmer_ord", {
      notes: "Camión en ruta por la autopista Duarte",
    });
    expect(enCamino.status).toBe("EN_CAMINO");

    // 3. Comprador confirma recepción conforme con ENTREGADO
    const entregado = ordersService.transitionOrderStatus(order.id, "ENTREGADO", "u_buyer_ord", {
      notes: "Producto recibido en excelente estado y peso exacto",
      receivedQuantity: 15,
    });
    expect(entregado.status).toBe("ENTREGADO");
    expect(entregado.received_quantity).toBe(15);

    // 4. Verificar historial completo en order_timeline
    const timeline = ordersService.getOrderTimeline(order.id);
    expect(timeline).toHaveLength(4); // CONFIRMADO -> EN_PREPARACION -> EN_CAMINO -> ENTREGADO
    const statuses = timeline.map((e) => e.to_status);
    expect(statuses).toEqual(["CONFIRMADO", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO"]);
  });

  it("debe rechazar transiciones de estado ilegales o no autorizadas", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    quotesService.createQuote(
      {
        id: "q_illegal",
        post_id: "post_tomate",
        seller_id: "u_farmer_ord",
        quantity: 5,
        unit: "CAJA",
        price_per_unit: 450.0,
        delivery_mode: "ENTREGA_VENDEDOR",
        delivery_location: "Local",
        target_date: "2026-10-22",
        expires_at: futureDate,
      },
      "u_buyer_ord"
    );
    quotesService.acceptQuote("q_illegal", "u_farmer_ord");
    const order = ordersService.createOrderFromQuote("q_illegal", "u_buyer_ord");

    // Salto ilegal: De CONFIRMADO directamente a ENTREGADO sin preparación/despacho
    expect(() => {
      ordersService.transitionOrderStatus(order.id, "ENTREGADO", "u_buyer_ord");
    }).toThrow(/Transición ilegal/);

    // Usuario ajeno intentando cambiar estado
    expect(() => {
      ordersService.transitionOrderStatus(order.id, "EN_PREPARACION", "u_extranjero");
    }).toThrow(/No autorizado/);
  });
});
