import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import {
  AdminService,
  UnauthorizedAdminActionError,
  ImmutableHistoryViolationError,
} from "@/modules/admin/service";

describe("Fase 15: Administración, Moderación y Auditoría", () => {
  let db: Database.Database;
  let service: AdminService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);

    // Sembrar usuarios de prueba
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role, status)
      VALUES 
        ('admin_1', 'admin@campo.do', '8095559000', 'hash_admin', 'ADMIN', 'ACTIVE'),
        ('farmer_1', 'campesino@campo.do', '8095559001', 'hash_farmer', 'FARMER', 'ACTIVE'),
        ('buyer_1', 'comprador@campo.do', '8095559002', 'hash_buyer', 'BUYER_BUSINESS', 'ACTIVE')
    `).run();

    // Sembrar perfil y publicación
    db.prepare(`
      INSERT INTO farmer_profiles (id, user_id, farm_name, province, municipality, contact_phone)
      VALUES ('fp_1', 'farmer_1', 'Finca Buena Vista', 'La Vega', 'Constanza', '8095559001')
    `).run();

    db.prepare(`
      INSERT INTO marketplace_posts (
        id, user_id, post_type, title, category_id, variety, quantity, unit,
        price_per_unit, target_date, province, municipality, status
      ) VALUES (
        'post_test', 'farmer_1', 'OFERTA', 'Tomate Barceló de Primera',
        'cat_vegetales', 'Barceló', 200, 'CAJA', 600, '2026-10-25', 'La Vega', 'Constanza', 'ACTIVA'
      )
    `).run();

    service = new AdminService(db);
  });

  afterEach(() => {
    db.close();
  });

  it("REGLA DE SEGURIDAD: Rechaza acceso a no administradores con error no autorizado", () => {
    expect(() => {
      service.assertIsAdmin("farmer_1");
    }).toThrow(UnauthorizedAdminActionError);

    expect(() => {
      service.assertIsAdmin("buyer_1");
    }).toThrow(UnauthorizedAdminActionError);

    expect(() => {
      service.assertIsAdmin("admin_1");
    }).not.toThrow();
  });

  it("debe exigir motivo válido y registrar auditoría obligatoria en cada acción", () => {
    // Intento con motivo vacío o muy corto
    expect(() => {
      service.updateUserStatus("admin_1", "farmer_1", "SUSPENDED", "no");
    }).toThrow(/Se requiere una justificación\/motivo/);

    // Con motivo adecuado
    service.updateUserStatus(
      "admin_1",
      "farmer_1",
      "SUSPENDED",
      "Reporte de actividad sospechosa en precios mayoristas"
    );

    const user = db.prepare("SELECT status FROM users WHERE id = 'farmer_1'").get() as { status: string };
    expect(user.status).toBe("SUSPENDED");

    const logs = service.getAuditLogs("admin_1");
    expect(logs.length).toBe(1);
    expect(logs[0].actor_id).toBe("admin_1");
    expect(logs[0].action).toBe("USER_STATUS_CHANGE");
    expect(logs[0].target_id).toBe("farmer_1");
    expect(logs[0].reason).toContain("Reporte de actividad sospechosa");
    expect(logs[0].changes_json).toContain("SUSPENDED");
  });

  it("debe permitir moderar publicaciones reportadas con registro de auditoría", () => {
    service.moderatePost(
      "admin_1",
      "post_test",
      "CERRADA",
      "Publicación bajo revisión por inconsistencia de fotos"
    );

    const post = db.prepare("SELECT status FROM marketplace_posts WHERE id = 'post_test'").get() as { status: string };
    expect(post.status).toBe("CERRADA");

    const logs = service.getAuditLogs("admin_1");
    expect(logs[0].action).toBe("POST_MODERATION");
  });

  it("debe permitir verificar fincas de manera gratuita con trazabilidad", () => {
    service.verifyFarm(
      "admin_1",
      "farmer_1",
      true,
      "Finca inspeccionada físicamente por técnico agrícola zonal",
      "Aprobación de certificación de origen"
    );

    const sub = db.prepare("SELECT is_verified, verification_notes FROM user_subscriptions WHERE user_id = 'farmer_1'").get() as { is_verified: number; verification_notes: string };
    expect(sub.is_verified).toBe(1);
    expect(sub.verification_notes).toContain("inspeccionada físicamente");

    const logs = service.getAuditLogs("admin_1");
    expect(logs[0].action).toBe("FARM_VERIFIED");
  });

  it("REGLA TRANSACCIONAL: Impide que un administrador altere términos de pedidos sin trazabilidad", () => {
    expect(() => {
      service.assertCannotAlterOrderTerms("admin_1", "TC-ORD-0001");
    }).toThrow(ImmutableHistoryViolationError);
  });

  it("debe entregar métricas globales del sistema exclusivamente a administradores", () => {
    const metrics = service.getSystemMetrics("admin_1");
    expect(metrics.totalUsers).toBe(3);
    expect(metrics.activePosts).toBe(1);
    expect(metrics.totalOrders).toBe(0);
  });
});
