import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds, rollbackMigration } from "@/db/migrator";

describe("Modelo de Datos y Persistencia Relacional (Fase 05)", () => {
  let db: Database.Database;

  beforeEach(() => {
    // Usar base de datos en memoria para pruebas aisladas y ultra-rápidas
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
  });

  afterEach(() => {
    db.close();
  });

  it("debe aplicar la migración 0001 y registrar la versión en schema_migrations", () => {
    const applied = runMigrations(db);
    expect(applied).toContain("0001_initial_schema.sql");

    const row = db
      .prepare("SELECT * FROM schema_migrations WHERE version = '0001'")
      .get() as { version: string; name: string };

    expect(row).toBeDefined();
    expect(row.version).toBe("0001");
    expect(row.name).toBe("0001_initial_schema.sql");
  });

  it("no debe reaplicar migraciones ya ejecutadas (idempotencia)", () => {
    runMigrations(db);
    const secondRun = runMigrations(db);
    expect(secondRun).toHaveLength(0);
  });

  it("debe aplicar semillas iniciales de categorías del campo dominicano", () => {
    runMigrations(db);
    const appliedSeeds = runSeeds(db);
    expect(appliedSeeds).toContain("0001_categories.sql");

    const categories = db.prepare("SELECT slug, name FROM categories ORDER BY slug").all() as { slug: string; name: string }[];
    expect(categories.length).toBe(4);
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("tuberculos");
    expect(slugs).toContain("vegetales");
    expect(slugs).toContain("frutas");
    expect(slugs).toContain("granos");
  });

  it("debe exigir unicidad de email y teléfono en users", () => {
    runMigrations(db);

    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u1', 'juan@campo.do', '8095550101', 'hash123', 'FARMER')
    `).run();

    // Intento con mismo email
    expect(() => {
      db.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role)
        VALUES ('u2', 'juan@campo.do', '8095550102', 'hash123', 'FARMER')
      `).run();
    }).toThrow(/UNIQUE constraint failed: users\.email/);

    // Intento con mismo teléfono
    expect(() => {
      db.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role)
        VALUES ('u3', 'pedro@campo.do', '8095550101', 'hash123', 'FARMER')
      `).run();
    }).toThrow(/UNIQUE constraint failed: users\.phone/);
  });

  it("debe rechazar roles inválidos mediante CHECK constraint", () => {
    runMigrations(db);

    expect(() => {
      db.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role)
        VALUES ('u_inv', 'invalido@campo.do', '8095559999', 'hash123', 'SUPERHERO')
      `).run();
    }).toThrow(/CHECK constraint failed/);
  });

  it("debe aplicar integridad referencial (FOREIGN KEY) y cascada", () => {
    runMigrations(db);

    // 1. Falla al insertar farmer_profile para usuario inexistente
    expect(() => {
      db.prepare(`
        INSERT INTO farmer_profiles (id, user_id, farm_name, province, municipality, contact_phone)
        VALUES ('fp1', 'usuario_inexistente', 'Finca La Esperanza', 'La Vega', 'Constanza', '8095550101')
      `).run();
    }).toThrow(/FOREIGN KEY constraint failed/);

    // 2. Éxito cuando el usuario existe
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u_farmer', 'agricultor@campo.do', '8095550123', 'hash123', 'FARMER')
    `).run();

    db.prepare(`
      INSERT INTO farmer_profiles (id, user_id, farm_name, province, municipality, contact_phone)
      VALUES ('fp_farmer', 'u_farmer', 'Finca La Esperanza', 'La Vega', 'Constanza', '8095550123')
    `).run();

    const profile = db.prepare("SELECT * FROM farmer_profiles WHERE user_id = 'u_farmer'").get();
    expect(profile).toBeDefined();

    // 3. Eliminación en CASCADA
    db.prepare("DELETE FROM users WHERE id = 'u_farmer'").run();
    const profileAfter = db.prepare("SELECT * FROM farmer_profiles WHERE user_id = 'u_farmer'").get();
    expect(profileAfter).toBeUndefined();
  });

  it("debe validar unidades de medida agrícolas dominicanas en publications", () => {
    runMigrations(db);
    runSeeds(db);

    // Crear usuario y perfil
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u_prod', 'prod@campo.do', '8095557777', 'hash123', 'FARMER')
    `).run();

    db.prepare(`
      INSERT INTO farmer_profiles (id, user_id, farm_name, province, municipality, contact_phone)
      VALUES ('fp_prod', 'u_prod', 'Finca El Valle', 'Espaillat', 'Moca', '8095557777')
    `).run();

    // Unidad permitida: QQ (Quintal)
    db.prepare(`
      INSERT INTO publications (id, farmer_id, category_id, title, unit, available_quantity, unit_price, harvest_date, province, municipality)
      VALUES ('pub1', 'fp_prod', 'cat_tuberculos', 'Yuca Mocana', 'QQ', 100, 1500.00, '2026-10-15', 'Espaillat', 'Moca')
    `).run();

    const pub = db.prepare("SELECT * FROM publications WHERE id = 'pub1'").get() as { unit: string };
    expect(pub.unit).toBe("QQ");

    // Unidad no autorizada: POUNDS (debe ser LB)
    expect(() => {
      db.prepare(`
        INSERT INTO publications (id, farmer_id, category_id, title, unit, available_quantity, unit_price, harvest_date, province, municipality)
        VALUES ('pub_bad', 'fp_prod', 'cat_tuberculos', 'Yuca', 'POUNDS', 100, 1500.00, '2026-10-15', 'Espaillat', 'Moca')
      `).run();
    }).toThrow(/CHECK constraint failed/);
  });

  it("debe soportar reversión (rollback) limpia de la migración", () => {
    const applied = runMigrations(db);
    const lastApplied = applied[applied.length - 1];
    const initialCount = (db.prepare("SELECT COUNT(*) as count FROM schema_migrations").get() as { count: number }).count;
    
    const rolledBack = rollbackMigration(db);
    expect(rolledBack).toBe(lastApplied);

    const afterCount = (db.prepare("SELECT COUNT(*) as count FROM schema_migrations").get() as { count: number }).count;
    expect(afterCount).toBe(initialCount - 1);
  });
});
