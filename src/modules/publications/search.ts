import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";
import { AgriculturalUnit } from "@/modules/catalog/units";
import { MarketplacePost, PostType } from "./service";

export interface SearchFilterParams {
  query?: string;
  post_type?: PostType;
  category_id?: string;
  product_id?: string;
  province?: string;
  municipality?: string;
  unit?: AgriculturalUnit;
  min_quantity?: number;
  max_price?: number;
  target_date_before?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: MarketplacePost[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  explanation: string;
}

export class DiscoveryService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  public searchPosts(filters: SearchFilterParams = {}): SearchResult {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["status = 'ACTIVA'"];
    const params: (string | number)[] = [];

    // 1. Filtro por tipo de publicación (OFERTA / DEMANDA)
    if (filters.post_type) {
      conditions.push("post_type = ?");
      params.push(filters.post_type);
    }

    // 2. Filtro por categoría
    if (filters.category_id) {
      conditions.push("category_id = ?");
      params.push(filters.category_id);
    }

    // 3. Filtro por producto de catálogo
    if (filters.product_id) {
      conditions.push("product_id = ?");
      params.push(filters.product_id);
    }

    // 4. Filtro por provincia / ubicación
    if (filters.province) {
      conditions.push("province = ?");
      params.push(filters.province);
    }

    if (filters.municipality) {
      conditions.push("municipality = ?");
      params.push(filters.municipality);
    }

    // 5. Filtro por unidad agrícola
    if (filters.unit) {
      conditions.push("unit = ?");
      params.push(filters.unit);
    }

    // 6. Filtro por cantidad mínima requerida
    if (filters.min_quantity !== undefined && filters.min_quantity > 0) {
      conditions.push("quantity >= ?");
      params.push(filters.min_quantity);
    }

    // 7. Filtro por precio máximo
    if (filters.max_price !== undefined && filters.max_price > 0) {
      conditions.push("price_per_unit <= ?");
      params.push(filters.max_price);
    }

    // 8. Filtro por fecha límite de disponibilidad
    if (filters.target_date_before) {
      conditions.push("target_date <= ?");
      params.push(filters.target_date_before);
    }

    // 9. Búsqueda de texto libre en título, variedad y descripción
    if (filters.query && filters.query.trim().length > 0) {
      const term = `%${filters.query.trim()}%`;
      conditions.push("(title LIKE ? OR variety LIKE ? OR description LIKE ?)");
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Conteo total para paginación
    const countSql = `SELECT COUNT(*) as total FROM marketplace_posts ${whereClause}`;
    const totalCount = (this.db.prepare(countSql).get(...params) as { total: number }).total;

    // Consulta paginada
    const itemsSql = `
      SELECT * FROM marketplace_posts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(itemsSql).all(...params, limit, offset) as MarketplacePost[];

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    let explanation = `Se encontraron ${totalCount} publicaciones activas.`;
    if (totalCount === 0) {
      explanation = "No se encontraron publicaciones que coincidan con los filtros aplicados. Intenta ampliar la ubicación o limpiar filtros.";
    }

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages,
      hasMore,
      explanation,
    };
  }

  /**
   * Retorna los filtros por defecto limpios para la UI.
   */
  public getDefaultFilters(): SearchFilterParams {
    return {
      page: 1,
      limit: 20,
    };
  }
}
