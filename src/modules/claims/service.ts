import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";

export type IncidentReason =
  | "CALIDAD_DEFICIENTE"
  | "DIFERENCIA_PESO_CANTIDAD"
  | "INCUMPLIMIENTO_FECHA"
  | "NO_PRESENTACION";

export type IncidentStatus = "ABIERTA" | "EN_MEDIACION" | "RESUELTA" | "RECHAZADA";

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  order_id: string;
  reported_by: string;
  reason: IncidentReason;
  description: string;
  evidence_url?: string;
  status: IncidentStatus;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export class TrustAndClaimsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  // ============================================================================
  // 1. SISTEMA DE REPUTACIÓN Y VALORACIONES
  // ============================================================================

  public submitReview(
    orderId: string,
    reviewerId: string,
    rating: number,
    comment?: string
  ): Review {
    // 1. Validar que el pedido exista y esté ENTREGADO (transacción elegible)
    const order = this.db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(orderId) as { id: string; buyer_id: string; seller_id: string; status: string } | undefined;

    if (!order) {
      throw new Error(`Pedido no encontrado: ${orderId}`);
    }

    if (order.status !== "ENTREGADO") {
      throw new Error("Solo se pueden calificar pedidos que hayan sido formalmente completados y entregados.");
    }

    // 2. Comprobar que el evaluador sea parte del pedido
    const isBuyer = order.buyer_id === reviewerId;
    const isSeller = order.seller_id === reviewerId;
    if (!isBuyer && !isSeller) {
      throw new Error("No autorizado: Solo el comprador o el vendedor pueden calificar esta transacción.");
    }

    // 3. Destinatario de la reseña es la contraparte
    const revieweeId = isBuyer ? order.seller_id : order.buyer_id;

    // 4. Validar rango de calificación
    if (rating < 1 || rating > 5) {
      throw new Error("La calificación debe estar entre 1 y 5 estrellas.");
    }

    // 5. Regla contra reseñas duplicadas
    const existing = this.db
      .prepare("SELECT id FROM reviews WHERE order_id = ? AND reviewer_id = ?")
      .get(orderId, reviewerId);

    if (existing) {
      throw new Error("Acción denegada: Ya has calificado este pedido previamente.");
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.db
      .prepare(`
        INSERT INTO reviews (id, order_id, reviewer_id, reviewee_id, rating, comment)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(reviewId, orderId, reviewerId, revieweeId, Math.floor(rating), comment || null);

    return this.getReviewById(reviewId)!;
  }

  public getReviewById(id: string): Review | null {
    const r = this.db.prepare("SELECT * FROM reviews WHERE id = ?").get(id) as Review | undefined;
    return r || null;
  }

  public getReviewsForUser(userId: string): Review[] {
    return this.db
      .prepare("SELECT * FROM reviews WHERE reviewee_id = ? ORDER BY created_at DESC")
      .all(userId) as Review[];
  }

  // ============================================================================
  // 2. SISTEMA DE INCIDENCIAS Y RESOLUCIÓN HUMANA
  // ============================================================================

  public openIncident(
    orderId: string,
    reportedById: string,
    reason: IncidentReason,
    description: string,
    evidenceUrl?: string
  ): Incident {
    const order = this.db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(orderId) as { id: string; buyer_id: string; seller_id: string; status: string } | undefined;

    if (!order) {
      throw new Error(`Pedido no encontrado: ${orderId}`);
    }

    const isParty = order.buyer_id === reportedById || order.seller_id === reportedById;
    if (!isParty) {
      throw new Error("No autorizado: Solo las partes involucradas pueden reportar una incidencia en este pedido.");
    }

    if (!description || description.trim().length < 10) {
      throw new Error("La descripción del reclamo debe tener al menos 10 caracteres explicativos.");
    }

    const incidentId = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.db
      .prepare(`
        INSERT INTO incidents (id, order_id, reported_by, reason, description, evidence_url, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ABIERTA')
      `)
      .run(incidentId, orderId, reportedById, reason, description, evidenceUrl || null);

    return this.getIncidentById(incidentId)!;
  }

  public getIncidentById(id: string): Incident | null {
    const inc = this.db.prepare("SELECT * FROM incidents WHERE id = ?").get(id) as Incident | undefined;
    return inc || null;
  }

  /**
   * Resolución humana por mediador administrativo.
   * Regla crítica: Sin penalizaciones financieras automáticas.
   */
  public resolveIncident(
    incidentId: string,
    adminUserId: string,
    adminRole: string,
    resolution: "RESUELTA" | "RECHAZADA",
    notes: string
  ): Incident {
    if (adminRole !== "ADMIN") {
      throw new Error("No autorizado: Solo un administrador de la plataforma puede mediar y resolver incidencias.");
    }

    const inc = this.getIncidentById(incidentId);
    if (!inc) {
      throw new Error(`Incidencia no encontrada: ${incidentId}`);
    }

    if (inc.status === "RESUELTA" || inc.status === "RECHAZADA") {
      throw new Error(`Esta incidencia ya fue dictaminada previamente como ${inc.status}.`);
    }

    if (!notes || notes.trim().length < 5) {
      throw new Error("Se requiere una nota explicativa de mediación para cerrar la incidencia.");
    }

    this.db
      .prepare(`
        UPDATE incidents
        SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(resolution, notes, adminUserId, incidentId);

    return this.getIncidentById(incidentId)!;
  }

  public listIncidentsForOrder(orderId: string): Incident[] {
    return this.db
      .prepare("SELECT * FROM incidents WHERE order_id = ? ORDER BY created_at DESC")
      .all(orderId) as Incident[];
  }
}
