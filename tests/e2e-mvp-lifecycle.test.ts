import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { runMigrations, runSeeds } from "@/db/migrator";
import { PublicationsService } from "@/modules/publications/service";
import { DiscoveryService } from "@/modules/publications/search";
import { QuotesService } from "@/modules/orders/quotes";
import { OrdersService } from "@/modules/orders/orders";
import { TrustAndClaimsService } from "@/modules/claims/service";
import { SubscriptionsService } from "@/modules/identity/plans";
import { NotificationsService } from "@/modules/notifications/service";
import { AdminService } from "@/modules/admin/service";
import { createDatabaseBackup } from "@/db/backup";

describe("Fase 16: Validación Final E2E del Ciclo Completo del MVP", () => {
  let db: Database.Database;
  const tempBackupDir = path.resolve(process.cwd(), "data/test-backups");

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(tempBackupDir)) {
      fs.rmSync(tempBackupDir, { recursive: true, force: true });
    }
  });

  it("debe ejecutar el ciclo de vida completo: publicación -> cotización -> contrapropuesta -> pedido -> entrega -> reseña -> reclamo -> auditoría -> backup", async () => {
    // -------------------------------------------------------------------------
    // 1. REGISTRO DE PARTICIPANTES (Productor, Comprador y Administrador)
    // -------------------------------------------------------------------------
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role, status)
      VALUES 
        ('farmer_juan', 'juan@campo.do', '8095551001', 'hash_pw1', 'FARMER', 'ACTIVE'),
        ('buyer_pedro', 'pedro@colmado.do', '8095551002', 'hash_pw2', 'BUYER_BUSINESS', 'ACTIVE'),
        ('admin_maria', 'maria@tecnocosecha.do', '8095551003', 'hash_pw3', 'ADMIN', 'ACTIVE')
    `).run();

    db.prepare(`
      INSERT INTO farmer_profiles (id, user_id, farm_name, province, municipality, contact_phone)
      VALUES ('fp_juan', 'farmer_juan', 'Finca Tierra Alta', 'La Vega', 'Jarabacoa', '8095551001')
    `).run();

    db.prepare(`
      INSERT INTO buyer_profiles (id, user_id, buyer_type, business_name, delivery_address, contact_phone)
      VALUES ('bp_pedro', 'buyer_pedro', 'BUSINESS', 'Colmado Pedro Hermanos', 'Calle Mella 45, La Vega', '8095551002')
    `).run();

    // -------------------------------------------------------------------------
    // 2. GOBERNANZA DE PLANES Y LÍMITES EN SERVIDOR (Fase 13)
    // -------------------------------------------------------------------------
    const subService = new SubscriptionsService(db);
    // Juan inicia con Explora (gratuito)
    const initialSub = subService.getUserSubscription("farmer_juan");
    expect(initialSub.plan_tier).toBe("EXPLORA");
    expect(initialSub.limits.maxActivePosts).toBe(1);

    // Para manejar múltiples lotes, actualiza a VENDEDOR sin cargos automáticos
    subService.updatePlan("farmer_juan", "VENDEDOR");
    const upgradedSub = subService.getUserSubscription("farmer_juan");
    expect(upgradedSub.plan_tier).toBe("VENDEDOR");
    expect(upgradedSub.limits.maxActivePosts).toBe(10);

    // -------------------------------------------------------------------------
    // 3. PUBLICACIÓN DE COSECHA EN UNIDAD AGRÍCOLA DOMINICANA (Fases 07 y 08)
    // -------------------------------------------------------------------------
    const pubService = new PublicationsService(db);
    const post = pubService.createPost(
      {
        id: "post_platano_01",
        post_type: "OFERTA",
        category_id: "cat_tuberculos",
        title: "Plátano Macho de Jarabacoa",
        variety: "Macho Criollo",
        quantity: 100,
        unit: "QQ", // Quintales
        price_per_unit: 1400.0,
        target_date: "2026-10-30",
        province: "La Vega",
        municipality: "Jarabacoa",
      },
      "farmer_juan"
    );
    expect(post).toBeDefined();
    expect(post.unit).toBe("QQ");
    expect(post.status).toBe("ACTIVA");

    // -------------------------------------------------------------------------
    // 4. DESCUBRIMIENTO Y BÚSQUEDA MULTI-CRITERIO (Fase 09)
    // -------------------------------------------------------------------------
    const discoveryService = new DiscoveryService(db);
    const searchResult = discoveryService.searchPosts({
      query: "Plátano",
      province: "La Vega",
      unit: "QQ",
    });
    expect(searchResult.totalCount).toBe(1);
    expect(searchResult.items[0].id).toBe("post_platano_01");

    // -------------------------------------------------------------------------
    // 5. SOLICITUD DE COTIZACIÓN Y CONTRAPROPUESTA VERSIONADA (Fase 10)
    // -------------------------------------------------------------------------
    const quotesService = new QuotesService(db);
    const notifService = new NotificationsService(db);

    // Pedro envía propuesta inicial: 50 QQ a RD$ 1,250 c/u
    const quote1 = quotesService.createQuote(
      {
        id: "q_init",
        post_id: post.id,
        seller_id: "farmer_juan",
        quantity: 50,
        unit: "QQ",
        price_per_unit: 1250.0,
        delivery_mode: "PUNTO_ACOPIO",
        delivery_location: "Entrada Jarabacoa",
        target_date: "2026-10-30",
        expires_at: "2026-11-05",
      },
      "buyer_pedro"
    );
    expect(quote1.status).toBe("PENDIENTE");
    expect(quote1.version).toBe(1);

    // Juan contrapropone: 50 QQ a RD$ 1,350 c/u
    const quote2 = quotesService.counterQuote(
      "q_init",
      {
        id: "q_counter",
        price_per_unit: 1350.0,
      },
      "farmer_juan"
    );
    expect(quote2.version).toBe(2);
    expect(quote2.status).toBe("PENDIENTE");

    // Pedro acepta la contrapropuesta
    const acceptedQuote = quotesService.acceptQuote("q_counter", "buyer_pedro");
    expect(acceptedQuote.status).toBe("ACEPTADA");

    // -------------------------------------------------------------------------
    // 6. FORMALIZACIÓN DE PEDIDO Y MÁQUINA DE ESTADOS (Fase 11)
    // -------------------------------------------------------------------------
    const ordersService = new OrdersService(db);
    const order = ordersService.createOrderFromQuote(
      acceptedQuote.id,
      "buyer_pedro"
    );
    expect(order.order_number).toMatch(/^TC-ORD-/);
    expect(order.total_price).toBe(50 * 1350.0);
    expect(order.status).toBe("CONFIRMADO");

    // Juan prepara el despacho
    ordersService.transitionOrderStatus(order.id, "EN_PREPARACION", "farmer_juan", {
      notes: "Corte realizado y empacado en sacos estándar.",
    });

    // Juan despacha el transporte
    ordersService.transitionOrderStatus(order.id, "EN_CAMINO", "farmer_juan", {
      notes: "Camioneta Daihatsu en camino al punto de acopio.",
    });

    // Pedro inspecciona y confirma recepción física con merma registrada (48 QQ recibidos)
    const completedOrder = ordersService.transitionOrderStatus(
      order.id,
      "ENTREGADO",
      "buyer_pedro",
      {
        receivedQuantity: 48,
        notes: "Carga recibida. 2 quintales de merma por maduración excesiva.",
      }
    );
    expect(completedOrder.status).toBe("ENTREGADO");
    expect(completedOrder.received_quantity).toBe(48);

    // -------------------------------------------------------------------------
    // 7. VALORACIÓN DE CONFIANZA Y MEDIACIÓN DE DISPUTA (Fase 12)
    // -------------------------------------------------------------------------
    const claimsService = new TrustAndClaimsService(db);

    // Calificación de reputación post-entrega
    const review = claimsService.submitReview(
      order.id,
      "buyer_pedro",
      4,
      "Excelente calidad general, aunque hubo merma leve en peso."
    );
    expect(review.rating).toBe(4);

    // Pedro abre una incidencia por diferencia de peso
    const incident = claimsService.openIncident(
      order.id,
      "buyer_pedro",
      "DIFERENCIA_PESO_CANTIDAD",
      "Se pactaron 50 QQ pero pesaron 48 QQ en la báscula.",
      "https://tecnocosecha.do/evidencias/pesaje_48qq.jpg"
    );
    expect(incident.status).toBe("ABIERTA");

    // -------------------------------------------------------------------------
    // 8. PANEL ADMINISTRATIVO Y LIBRO DE AUDITORÍA (Fase 15)
    // -------------------------------------------------------------------------
    const adminService = new AdminService(db);

    // María resuelve la controversia administrativamente con acuerdo mutuo
    adminService.resolveIncident(
      "admin_maria",
      incident.id,
      "RESUELTA",
      "Acuerdo mediado: Productor compensará los 2 QQ en el siguiente despacho.",
      "Cierre satisfactorio acordado telefónicamente entre ambas partes"
    );

    const auditLogs = adminService.getAuditLogs("admin_maria");
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(auditLogs[0].action).toBe("INCIDENT_RESOLVED");

    // María verifica la finca de Juan de forma gratuita
    adminService.verifyFarm(
      "admin_maria",
      "farmer_juan",
      true,
      "Inspección satelital y visita comunitaria aprobadas.",
      "Otorgamiento de sello de productor verificado"
    );
    const verifiedFarmer = subService.getUserSubscription("farmer_juan");
    expect(verifiedFarmer.is_verified).toBe(1);

    // -------------------------------------------------------------------------
    // 9. REVISIÓN DE NOTIFICACIONES EMITIDAS (Fase 14)
    // -------------------------------------------------------------------------
    const juanNotifs = notifService.getUserNotifications("farmer_juan");
    expect(juanNotifs.length).toBeGreaterThan(0);

    // -------------------------------------------------------------------------
    // 10. COPIA DE SEGURIDAD EN CALIENTE (Fase 16)
    // -------------------------------------------------------------------------
    const backup = await createDatabaseBackup(db, tempBackupDir);
    expect(backup.success).toBe(true);
    expect(backup.sizeBytes).toBeGreaterThan(0);
    expect(fs.existsSync(backup.backupPath)).toBe(true);
  });
});
