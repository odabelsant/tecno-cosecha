import Database from "better-sqlite3";
import crypto from "crypto";
import { getDatabase } from "@/db/connection";

export type NotificationEventType =
  | "QUOTE_RECEIVED"
  | "QUOTE_COUNTERED"
  | "QUOTE_ACCEPTED"
  | "ORDER_STATUS_CHANGED"
  | "INCIDENT_OPENED"
  | "INCIDENT_RESOLVED";

export type ReferenceType = "QUOTE" | "ORDER" | "INCIDENT" | "SYSTEM";

export interface CreateNotificationInput {
  userId: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: ReferenceType;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  event_type: NotificationEventType;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: ReferenceType | null;
  is_read: number;
  created_at: string;
}

export class NotificationsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  /**
   * Crea una notificación in-app esencial.
   * REGLA CANÓNICA: Evita duplicados idénticos no leídos y protege la privacidad.
   */
  public notify(input: CreateNotificationInput): NotificationRecord | null {
    // 1. Sanitización de privacidad básica
    const cleanTitle = input.title.trim();
    const cleanMessage = input.message.trim();

    // 2. Control anti-duplicados: si ya existe una notificación idéntica sin leer para la misma referencia
    if (input.referenceId) {
      const existing = this.db
        .prepare(`
          SELECT id FROM notifications
          WHERE user_id = ? AND event_type = ? AND reference_id = ? AND is_read = 0
        `)
        .get(input.userId, input.eventType, input.referenceId);

      if (existing) {
        // Idempotencia: no spamear ni duplicar la campanita
        return null;
      }
    }

    const id = "notif_" + crypto.randomUUID().slice(0, 10);
    this.db
      .prepare(`
        INSERT INTO notifications (
          id, user_id, event_type, title, message, reference_id, reference_type, is_read
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `)
      .run(
        id,
        input.userId,
        input.eventType,
        cleanTitle,
        cleanMessage,
        input.referenceId || null,
        input.referenceType || null
      );

    return this.db
      .prepare("SELECT * FROM notifications WHERE id = ?")
      .get(id) as NotificationRecord;
  }

  /**
   * Lista notificaciones de un usuario ordenadas cronológicamente.
   */
  public getUserNotifications(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ): NotificationRecord[] {
    const limit = options?.limit ?? 30;
    if (options?.unreadOnly) {
      return this.db
        .prepare(`
          SELECT * FROM notifications
          WHERE user_id = ? AND is_read = 0
          ORDER BY datetime(created_at) DESC
          LIMIT ?
        `)
        .all(userId, limit) as NotificationRecord[];
    }

    return this.db
      .prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT ?
      `)
      .all(userId, limit) as NotificationRecord[];
  }

  /**
   * Obtiene la cantidad de notificaciones sin leer.
   */
  public getUnreadCount(userId: string): number {
    const row = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM notifications
        WHERE user_id = ? AND is_read = 0
      `)
      .get(userId) as { count: number };

    return row?.count || 0;
  }

  /**
   * Marca una notificación específica como leída.
   */
  public markAsRead(notificationId: string, userId: string): boolean {
    const res = this.db
      .prepare(`
        UPDATE notifications
        SET is_read = 1
        WHERE id = ? AND user_id = ?
      `)
      .run(notificationId, userId);

    return res.changes > 0;
  }

  /**
   * Marca todas las notificaciones pendientes de un usuario como leídas.
   */
  public markAllAsRead(userId: string): number {
    const res = this.db
      .prepare(`
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = ? AND is_read = 0
      `)
      .run(userId);

    return res.changes;
  }
}
