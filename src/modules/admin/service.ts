import Database from "better-sqlite3";
import crypto from "crypto";
import { getDatabase } from "@/db/connection";
import { SubscriptionsService } from "@/modules/identity/plans";

export type AdminAuditAction =
  | "USER_STATUS_CHANGE"
  | "USER_PLAN_OVERRIDE"
  | "POST_MODERATION"
  | "INCIDENT_RESOLVED"
  | "INCIDENT_REJECTED"
  | "TUTORIAL_UPDATED"
  | "FARM_VERIFIED";

export interface AuditLogRecord {
  id: string;
  actor_id: string;
  action: AdminAuditAction;
  target_entity: string;
  target_id: string;
  reason: string;
  changes_json: string | null;
  created_at: string;
}

export class UnauthorizedAdminActionError extends Error {
  public readonly code = "UNAUTHORIZED_ADMIN_ACTION";
  constructor(message = "Acceso denegado: Se requiere rol de Administrador para ejecutar esta acción.") {
    super(message);
    this.name = "UnauthorizedAdminActionError";
  }
}

export class ImmutableHistoryViolationError extends Error {
  public readonly code = "IMMUTABLE_HISTORY_VIOLATION";
  constructor(message = "Regla de integridad: No se permite modificar el historial transaccional ni pedidos congelados de forma unilateral.") {
    super(message);
    this.name = "ImmutableHistoryViolationError";
  }
}

export class AdminService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  /**
   * Valida en backend que el actor tenga rol 'ADMIN'.
   * Mínimo privilegio y protección en el servidor.
   */
  public assertIsAdmin(actorId: string): void {
    const user = this.db
      .prepare("SELECT role, status FROM users WHERE id = ?")
      .get(actorId) as { role: string; status: string } | undefined;

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      throw new UnauthorizedAdminActionError();
    }
  }

  /**
   * Registra una acción sensible en el libro inmutable de auditoría.
   */
  public logAudit(input: {
    actorId: string;
    action: AdminAuditAction;
    targetEntity: string;
    targetId: string;
    reason: string;
    changes?: Record<string, unknown>;
  }): AuditLogRecord {
    this.assertIsAdmin(input.actorId);

    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error("Se requiere una justificación/motivo de al menos 5 caracteres para auditar la acción.");
    }

    const id = "audit_" + crypto.randomUUID().slice(0, 10);
    const changesJson = input.changes ? JSON.stringify(input.changes) : null;

    this.db
      .prepare(`
        INSERT INTO admin_audit_logs (
          id, actor_id, action, target_entity, target_id, reason, changes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, input.actorId, input.action, input.targetEntity, input.targetId, input.reason.trim(), changesJson);

    return this.db
      .prepare("SELECT * FROM admin_audit_logs WHERE id = ?")
      .get(id) as AuditLogRecord;
  }

  /**
   * Moderación de estado de usuario (ej. suspender por fraude o reactivar).
   */
  public updateUserStatus(
    actorId: string,
    targetUserId: string,
    newStatus: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION",
    reason: string
  ): void {
    this.assertIsAdmin(actorId);

    const prev = this.db.prepare("SELECT status FROM users WHERE id = ?").get(targetUserId) as { status: string } | undefined;
    if (!prev) throw new Error(`Usuario no encontrado: ${targetUserId}`);

    this.db
      .prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(newStatus, targetUserId);

    this.logAudit({
      actorId,
      action: "USER_STATUS_CHANGE",
      targetEntity: "users",
      targetId: targetUserId,
      reason,
      changes: { from: prev.status, to: newStatus },
    });
  }

  /**
   * Moderación de publicaciones reportadas o sospechosas.
   */
  public moderatePost(
    actorId: string,
    postId: string,
    newStatus: "CERRADA" | "BORRADOR",
    reason: string
  ): void {
    this.assertIsAdmin(actorId);

    const post = this.db.prepare("SELECT status FROM marketplace_posts WHERE id = ?").get(postId) as { status: string } | undefined;
    if (!post) throw new Error(`Publicación no encontrada: ${postId}`);

    this.db
      .prepare("UPDATE marketplace_posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(newStatus, postId);

    this.logAudit({
      actorId,
      action: "POST_MODERATION",
      targetEntity: "marketplace_posts",
      targetId: postId,
      reason,
      changes: { from: post.status, to: newStatus },
    });
  }

  /**
   * Resolución administrativa de incidencias.
   */
  public resolveIncident(
    actorId: string,
    incidentId: string,
    resolution: "RESUELTA" | "RECHAZADA",
    mediationNotes: string,
    reason: string
  ): void {
    this.assertIsAdmin(actorId);

    const inc = this.db.prepare("SELECT status FROM incidents WHERE id = ?").get(incidentId) as { status: string } | undefined;
    if (!inc) throw new Error(`Incidencia no encontrada: ${incidentId}`);

    this.db
      .prepare(`
        UPDATE incidents
        SET status = ?, resolved_by = ?, resolution_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(resolution, actorId, mediationNotes, incidentId);

    this.logAudit({
      actorId,
      action: resolution === "RESUELTA" ? "INCIDENT_RESOLVED" : "INCIDENT_REJECTED",
      targetEntity: "incidents",
      targetId: incidentId,
      reason,
      changes: { status: resolution, notes: mediationNotes },
    });
  }

  /**
   * Verificación manual de una parcela/finca tras inspección documental.
   */
  public verifyFarm(
    actorId: string,
    targetUserId: string,
    isVerified: boolean,
    notes: string,
    reason: string
  ): void {
    this.assertIsAdmin(actorId);

    const subService = new SubscriptionsService(this.db);
    subService.setVerificationStatus(targetUserId, isVerified, notes);

    this.logAudit({
      actorId,
      action: "FARM_VERIFIED",
      targetEntity: "user_subscriptions",
      targetId: targetUserId,
      reason,
      changes: { is_verified: isVerified, notes },
    });
  }

  /**
   * Consulta los logs de auditoría para supervisión técnica.
   */
  public getAuditLogs(actorId: string, limit = 50): AuditLogRecord[] {
    this.assertIsAdmin(actorId);

    return this.db
      .prepare("SELECT * FROM admin_audit_logs ORDER BY datetime(created_at) DESC LIMIT ?")
      .all(limit) as AuditLogRecord[];
  }

  /**
   * Regla de protección de inmutabilidad transaccional:
   * Ningún administrador puede editar silenciosamente precios de un pedido congelado o timeline.
   */
  public assertCannotAlterOrderTerms(actorId: string, orderId: string): never {
    this.assertIsAdmin(actorId);
    throw new ImmutableHistoryViolationError(
      `Violación de gobernanza: El pedido ${orderId} contiene términos acordados legalmente inmutables.`
    );
  }

  /**
   * Obtiene métricas globales del sistema para el panel administrativo.
   */
  public getSystemMetrics(actorId: string) {
    this.assertIsAdmin(actorId);

    const totalUsers = (this.db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count;
    const activePosts = (this.db.prepare("SELECT COUNT(*) as count FROM marketplace_posts WHERE status = 'ACTIVA'").get() as { count: number }).count;
    const totalOrders = (this.db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number }).count;
    const pendingIncidents = (this.db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'ABIERTO'").get() as { count: number }).count;

    return {
      totalUsers,
      activePosts,
      totalOrders,
      pendingIncidents,
    };
  }
}
