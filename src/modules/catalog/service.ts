import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";
import { AgriculturalUnit, AGRICULTURAL_UNITS } from "./units";

export interface CatalogProduct {
  id: string;
  category_id: string;
  name: string;
  common_name: string;
  variety?: string;
  default_unit: AgriculturalUnit;
  origin_region?: string;
  is_regulated: number;
  is_active: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogProductDTO {
  id: string;
  category_id: string;
  name: string;
  common_name: string;
  variety?: string;
  default_unit: AgriculturalUnit;
  origin_region?: string;
  image_url?: string;
}

export class CatalogService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  public listProducts(categoryId?: string): CatalogProduct[] {
    if (categoryId) {
      return this.db
        .prepare("SELECT * FROM catalog_products WHERE category_id = ? AND is_active = 1 ORDER BY name ASC")
        .all(categoryId) as CatalogProduct[];
    }
    return this.db
      .prepare("SELECT * FROM catalog_products WHERE is_active = 1 ORDER BY name ASC")
      .all() as CatalogProduct[];
  }

  public getProductById(id: string): CatalogProduct | null {
    const product = this.db
      .prepare("SELECT * FROM catalog_products WHERE id = ?")
      .get(id) as CatalogProduct | undefined;
    return product || null;
  }

  public createProduct(dto: CreateCatalogProductDTO, userRole: string): CatalogProduct {
    // Control de autorización estricta: solo ADMIN puede crear productos de taxonomía
    if (userRole !== "ADMIN") {
      throw new Error("No autorizado: Solo administradores pueden añadir productos al catálogo maestro.");
    }

    // Validar unidad permitida
    if (!AGRICULTURAL_UNITS[dto.default_unit]) {
      throw new Error(`Unidad agrícola no permitida: ${dto.default_unit}`);
    }

    // Regla de negocio: Verificar que no sea una categoría regulada no autorizada
    const category = this.db
      .prepare("SELECT slug FROM categories WHERE id = ?")
      .get(dto.category_id) as { slug: string } | undefined;

    if (!category) {
      throw new Error(`La categoría ${dto.category_id} no existe.`);
    }

    const allowedCategories = ["tuberculos", "vegetales", "frutas", "granos"];
    if (!allowedCategories.includes(category.slug)) {
      throw new Error("Categoría no autorizada en el MVP (solo frutas, vegetales, tubérculos y granos permitidos).");
    }

    this.db
      .prepare(`
        INSERT INTO catalog_products (id, category_id, name, common_name, variety, default_unit, origin_region, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        dto.id,
        dto.category_id,
        dto.name,
        dto.common_name,
        dto.variety || null,
        dto.default_unit,
        dto.origin_region || null,
        dto.image_url || null
      );

    return this.getProductById(dto.id)!;
  }

  public deleteProduct(id: string, userRole: string): boolean {
    if (userRole !== "ADMIN") {
      throw new Error("No autorizado: Solo administradores pueden eliminar productos del catálogo maestro.");
    }

    const res = this.db.prepare("DELETE FROM catalog_products WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
