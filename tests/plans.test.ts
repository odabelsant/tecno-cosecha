import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations } from "@/db/migrator";
import {
  SubscriptionsService,
  PlanLimitExceededError,
  PLAN_DEFINITIONS,
} from "@/modules/identity/plans";

describe("Fase 13: Planes y Permisos de Suscripción", () => {
  let db: Database.Database;
  let service: SubscriptionsService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);

    // Sembrar usuarios de prueba
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_explora', 'explora@campo.do', '8095551001', 'hash1', 'FARMER'),
        ('u_vendedor', 'vendedor@campo.do', '8095551002', 'hash2', 'FARMER'),
        ('u_negocio', 'negocio@campo.do', '8095551003', 'hash3', 'BUYER_BUSINESS')
    `).run();

    service = new SubscriptionsService(db);
  });

  afterEach(() => {
    db.close();
  });

  it("debe asignar por defecto el plan EXPLORA (gratuito) a un usuario nuevo", () => {
    const sub = service.getUserSubscription("u_explora");
    expect(sub.plan_tier).toBe("EXPLORA");
    expect(sub.is_verified).toBe(0);
    expect(sub.limits.maxActivePosts).toBe(1);
    expect(sub.limits.maxActiveQuotes).toBe(3);
    expect(sub.limits.monthlyCostRD).toBe(0);
  });

  it("permite a un mismo usuario tener capacidades de comprador y vendedor en todos los planes", () => {
    const plans = service.getAvailablePlans();
    for (const plan of plans) {
      expect(plan.canSell).toBe(true);
      expect(plan.canBuy).toBe(true);
    }
  });

  it("debe aplicar límites en el servidor: lanzar error cuando se excede el límite de publicaciones", () => {
    // Plan EXPLORA permite máximo 1 publicación activa
    expect(() => {
      service.assertCanCreatePost("u_explora", 0);
    }).not.toThrow();

    expect(() => {
      service.assertCanCreatePost("u_explora", 1);
    }).toThrow(PlanLimitExceededError);

    // Actualizar a VENDEDOR permite hasta 10
    service.updatePlan("u_explora", "VENDEDOR");
    expect(() => {
      service.assertCanCreatePost("u_explora", 1);
    }).not.toThrow();
    expect(() => {
      service.assertCanCreatePost("u_explora", 9);
    }).not.toThrow();
    expect(() => {
      service.assertCanCreatePost("u_explora", 10);
    }).toThrow(PlanLimitExceededError);
  });

  it("debe aplicar límites en el servidor: lanzar error cuando se excede el límite de cotizaciones activas", () => {
    // Plan EXPLORA permite máximo 3 cotizaciones abiertas
    expect(() => {
      service.assertCanCreateQuote("u_explora", 2);
    }).not.toThrow();

    expect(() => {
      service.assertCanCreateQuote("u_explora", 3);
    }).toThrow(PlanLimitExceededError);

    // Actualizar a NEGOCIO permite hasta 500
    service.updatePlan("u_explora", "NEGOCIO");
    expect(() => {
      service.assertCanCreateQuote("u_explora", 3);
    }).not.toThrow();
    expect(() => {
      service.assertCanCreateQuote("u_explora", 100);
    }).not.toThrow();
  });

  it("REGLA CANÓNICA: No bloquea verificación básica por no pagar (usuarios gratuitos pueden verificarse)", () => {
    const subInitial = service.getUserSubscription("u_explora");
    expect(subInitial.plan_tier).toBe("EXPLORA");
    expect(subInitial.is_verified).toBe(0);

    // Verificar identidad/finca del usuario sin exigir pago ni cambio de plan
    const subVerified = service.setVerificationStatus(
      "u_explora",
      true,
      "Cédula y constancia de cultivo validadas por equipo regional."
    );

    expect(subVerified.plan_tier).toBe("EXPLORA");
    expect(subVerified.is_verified).toBe(1);
    expect(subVerified.verification_notes).toContain("Cédula y constancia");
  });

  it("no implementa cobros recurrentes automáticos en las definiciones de planes del MVP", () => {
    expect(PLAN_DEFINITIONS.EXPLORA.monthlyCostRD).toBe(0);
    expect(PLAN_DEFINITIONS.VENDEDOR.monthlyCostRD).toBe(0);
    expect(PLAN_DEFINITIONS.NEGOCIO.monthlyCostRD).toBe(0);
  });
});
