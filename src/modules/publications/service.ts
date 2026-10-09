import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";
import { AgriculturalUnit, AGRICULTURAL_UNITS } from "@/modules/catalog/units";

export type PostType = "OFERTA" | "DEMANDA";
export type PostStatus = "BORRADOR" | "ACTIVA" | "CERRADA";

export interface MarketplacePost {
  id: string;
  user_id: string;
  post_type: PostType;
  product_id?: string;
  category_id: string;
  title: string;
  variety?: string;
  description?: string;
  unit: AgriculturalUnit;
  quantity: number;
  price_per_unit: number;
  target_date: string;
  province: string;
  municipality: string;
  image_url?: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePostDTO {
  id: string;
  post_type: PostType;
  product_id?: string;
  category_id: string;
  title: string;
  variety?: string;
  description?: string;
  unit: AgriculturalUnit;
  quantity: number;
  price_per_unit: number;
  target_date: string;
  province: string;
  municipality: string;
  image_url?: string;
  status?: PostStatus; // Por defecto ACTIVA, o BORRADOR
}

export interface UpdatePostDTO {
  title?: string;
  variety?: string;
  description?: string;
  quantity?: number;
  price_per_unit?: number;
  target_date?: string;
  province?: string;
  municipality?: string;
  image_url?: string;
  status?: PostStatus;
}

export class PublicationsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  public createPost(dto: CreatePostDTO, userId: string): MarketplacePost {
    if (!userId) {
      throw new Error("No autenticado: Se requiere un usuario válido para publicar.");
    }

    if (dto.quantity <= 0) {
      throw new Error("La cantidad debe ser mayor que cero.");
    }

    if (dto.price_per_unit < 0) {
      throw new Error("El precio unitario no puede ser negativo.");
    }

    if (!AGRICULTURAL_UNITS[dto.unit]) {
      throw new Error(`Unidad agrícola no permitida: ${dto.unit}`);
    }

    const status = dto.status || "ACTIVA";

    this.db
      .prepare(`
        INSERT INTO marketplace_posts (
          id, user_id, post_type, product_id, category_id, title, variety,
          description, unit, quantity, price_per_unit, target_date,
          province, municipality, image_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        dto.id,
        userId,
        dto.post_type,
        dto.product_id || null,
        dto.category_id,
        dto.title,
        dto.variety || null,
        dto.description || null,
        dto.unit,
        dto.quantity,
        dto.price_per_unit,
        dto.target_date,
        dto.province,
        dto.municipality,
        dto.image_url || null,
        status
      );

    return this.getPostById(dto.id, userId)!;
  }

  public getPostById(postId: string, viewerUserId?: string, viewerRole?: string): MarketplacePost | null {
    const post = this.db
      .prepare("SELECT * FROM marketplace_posts WHERE id = ?")
      .get(postId) as MarketplacePost | undefined;

    if (!post) return null;

    // Regla de privacidad de borrador: solo el creador o un admin pueden ver borradores
    if (post.status === "BORRADOR") {
      const isOwner = viewerUserId && post.user_id === viewerUserId;
      const isAdmin = viewerRole === "ADMIN";
      if (!isOwner && !isAdmin) {
        return null;
      }
    }

    return post;
  }

  public updatePost(
    postId: string,
    dto: UpdatePostDTO,
    userId: string,
    userRole?: string
  ): MarketplacePost {
    const existing = this.getPostById(postId, userId, userRole);
    if (!existing) {
      throw new Error(`Publicación no encontrada: ${postId}`);
    }

    // Comprobación de permisos del dueño
    const isOwner = existing.user_id === userId;
    const isAdmin = userRole === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new Error("No autorizado: Solo el creador o un administrador pueden editar esta publicación.");
    }

    const title = dto.title !== undefined ? dto.title : existing.title;
    const variety = dto.variety !== undefined ? dto.variety : existing.variety;
    const description = dto.description !== undefined ? dto.description : existing.description;
    const quantity = dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const price_per_unit = dto.price_per_unit !== undefined ? dto.price_per_unit : existing.price_per_unit;
    const target_date = dto.target_date !== undefined ? dto.target_date : existing.target_date;
    const province = dto.province !== undefined ? dto.province : existing.province;
    const municipality = dto.municipality !== undefined ? dto.municipality : existing.municipality;
    const image_url = dto.image_url !== undefined ? dto.image_url : existing.image_url;
    const status = dto.status !== undefined ? dto.status : existing.status;

    if (quantity <= 0) {
      throw new Error("La cantidad debe ser mayor que cero.");
    }
    if (price_per_unit < 0) {
      throw new Error("El precio unitario no puede ser negativo.");
    }

    this.db
      .prepare(`
        UPDATE marketplace_posts
        SET title = ?, variety = ?, description = ?, quantity = ?,
            price_per_unit = ?, target_date = ?, province = ?,
            municipality = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        title,
        variety || null,
        description || null,
        quantity,
        price_per_unit,
        target_date,
        province,
        municipality,
        image_url || null,
        status,
        postId
      );

    return this.getPostById(postId, userId, userRole)!;
  }

  public closePost(postId: string, userId: string, userRole?: string): MarketplacePost {
    return this.updatePost(postId, { status: "CERRADA" }, userId, userRole);
  }

  /**
   * Lista publicaciones según la vista solicitada:
   * - GENERAL: Muestra todas las ofertas y demandas activas.
   * - COMPRAR: Muestra ofertas activas (lo que los productores venden).
   * - VENDER: Muestra demandas activas (lo que los comercios y clientes necesitan comprar).
   */
  public listPostsByView(
    view: "GENERAL" | "COMPRAR" | "VENDER"
  ): MarketplacePost[] {
    if (view === "COMPRAR") {
      // Un comprador busca qué comprar: se le muestran las OFERTAS activas
      return this.db
        .prepare("SELECT * FROM marketplace_posts WHERE post_type = 'OFERTA' AND status = 'ACTIVA' ORDER BY created_at DESC")
        .all() as MarketplacePost[];
    }

    if (view === "VENDER") {
      // Un productor busca qué vender: se le muestran las DEMANDAS activas de compradores
      return this.db
        .prepare("SELECT * FROM marketplace_posts WHERE post_type = 'DEMANDA' AND status = 'ACTIVA' ORDER BY created_at DESC")
        .all() as MarketplacePost[];
    }

    // Vista GENERAL: Muestra todas las activas
    return this.db
      .prepare("SELECT * FROM marketplace_posts WHERE status = 'ACTIVA' ORDER BY created_at DESC")
      .all() as MarketplacePost[];
  }

  /**
   * Lista las publicaciones propias de un usuario (incluyendo borradores y cerradas).
   */
  public listUserPosts(userId: string): MarketplacePost[] {
    return this.db
      .prepare("SELECT * FROM marketplace_posts WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as MarketplacePost[];
  }
}
