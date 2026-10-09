import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations, runSeeds } from "@/db/migrator";
import { PublicationsService } from "@/modules/publications";

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

function validateImageFile(filename: string, mimeType: string): { valid: boolean; error?: string } {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? "." + parts.pop()?.toLowerCase() : "";

  const isExtValid = SUPPORTED_EXTENSIONS.includes(ext);
  const isMimeValid = SUPPORTED_MIME_TYPES.includes(mimeType);

  if (!isExtValid && !isMimeValid) {
    return {
      valid: false,
      error: `Formato no compatible ("${ext || mimeType}"). Solo se aceptan JPEG/JPG, PNG, GIF, SVG o WebP.`,
    };
  }

  return { valid: true };
}

describe("Soporte de Imágenes y Formatos Web en Publicaciones (Fase de Imágenes)", () => {
  let db: Database.Database;
  let service: PublicationsService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    runSeeds(db);
    service = new PublicationsService(db);

    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES ('u_img_tester', 'productor@campo.test', '8095559999', 'hash123', 'FARMER')
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("debe validar explícitamente los 5 formatos estándar web (JPG, PNG, GIF, SVG, WebP)", () => {
    const testCases = [
      { name: "cosecha_tomates.jpg", mime: "image/jpeg", expected: true },
      { name: "zanahoria_lavada.jpeg", mime: "image/jpeg", expected: true },
      { name: "platano_macho.png", mime: "image/png", expected: true },
      { name: "animacion_riego.gif", mime: "image/gif", expected: true },
      { name: "icono_cultivo.svg", mime: "image/svg+xml", expected: true },
      { name: "aguacate_fresco.webp", mime: "image/webp", expected: true },
    ];

    for (const tc of testCases) {
      const res = validateImageFile(tc.name, tc.mime);
      expect(res.valid).toBe(tc.expected);
      expect(res.error).toBeUndefined();
    }
  });

  it("debe rechazar extensiones y tipos no compatibles con mensaje claro", () => {
    const invalidCases = [
      { name: "documento.pdf", mime: "application/pdf" },
      { name: "archivo.exe", mime: "application/octet-stream" },
      { name: "foto.bmp", mime: "image/bmp" },
      { name: "escaneo.tiff", mime: "image/tiff" },
    ];

    for (const ic of invalidCases) {
      const res = validateImageFile(ic.name, ic.mime);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("Formato no compatible");
    }
  });

  it("debe persistir el campo image_url en la base de datos al crear y actualizar publicaciones", () => {
    const post = service.createPost(
      {
        id: "post_with_image_01",
        post_type: "OFERTA",
        category_id: "cat_vegetales",
        title: "Tomate Barceló Selección",
        unit: "CAJA",
        quantity: 100,
        price_per_unit: 600,
        target_date: "2026-10-25",
        province: "La Vega",
        municipality: "Constanza",
        image_url: "/images/crops/tomate.svg",
        status: "ACTIVA",
      },
      "u_img_tester"
    );

    expect(post).toBeDefined();
    expect(post.image_url).toBe("/images/crops/tomate.svg");

    // Verificar actualización de imagen (ej. cambiar a WebP)
    const updated = service.updatePost(
      "post_with_image_01",
      { image_url: "/uploads/tomate_alta_res.webp" },
      "u_img_tester"
    );

    expect(updated.image_url).toBe("/uploads/tomate_alta_res.webp");
  });
});
