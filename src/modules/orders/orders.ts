import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";
import { QuotesService } from "./quotes";
import { NotificationsService } from "@/modules/notifications/service";

export type OrderStatus = "CONFIRMADO" | "EN_PREPARACION" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO";

export interface Order {
  id: string;
  order_number: string;
  quote_id: string;
  buyer_id: string;
  seller_id: string;
  product_title: string;
  quality_spec?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  delivery_mode: string;
  delivery_location: string;
  target_delivery_window: string;
  status: OrderStatus;
  received_quantity?: number;
  reception_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: number;
  order_id: string;
  from_status?: string;
  to_status: string;
  actor_id: string;
  notes?: string;
  created_at: string;
}

export class OrdersService {
  private db: Database.Database;
  private quotesService: QuotesService;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
    this.quotesService = new QuotesService(this.db);
  }

  public createOrderFromQuote(quoteId: string, actorId: string): Order {
    const quote = this.quotesService.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Cotización no encontrada: ${quoteId}`);
    }

    if (quote.status !== "ACEPTADA") {
      throw new Error(`Solo se puede generar un pedido a partir de una cotización ACEPTADA (estado actual: ${quote.status}).`);
    }

    // Comprobar que el actor sea parte de la cotización
    if (quote.buyer_id !== actorId && quote.seller_id !== actorId) {
      throw new Error("No autorizado: Solo el comprador o vendedor pueden formalizar el pedido.");
    }

    // Verificar si ya existe un pedido para esta cotización
    const existing = this.db.prepare("SELECT * FROM orders WHERE quote_id = ?").get(quoteId) as Order | undefined;
    if (existing) {
      return existing;
    }

    // Obtener título de la publicación original
    const post = this.db.prepare("SELECT title FROM marketplace_posts WHERE id = ?").get(quote.post_id) as { title: string } | undefined;
    const productTitle = post ? post.title : "Producto Agrícola";

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = `TC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalPrice = quote.quantity * quote.price_per_unit;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          INSERT INTO orders (
            id, order_number, quote_id, buyer_id, seller_id, product_title,
            quality_spec, quantity, unit, unit_price, total_price,
            delivery_mode, delivery_location, target_delivery_window, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADO')
        `)
        .run(
          orderId,
          orderNumber,
          quote.id,
          quote.buyer_id,
          quote.seller_id,
          productTitle,
          quote.quality_spec || null,
          quote.quantity,
          quote.unit,
          quote.price_per_unit,
          totalPrice,
          quote.delivery_mode,
          quote.delivery_location,
          quote.target_date
        );

      this.db
        .prepare(`
          INSERT INTO order_timeline (order_id, from_status, to_status, actor_id, notes)
          VALUES (?, NULL, 'CONFIRMADO', ?, 'Pedido formalizado a partir de cotización acordada.')
        `)
        .run(orderId, actorId);
    });

    tx();
    return this.getOrderById(orderId)!;
  }

  public getOrderById(orderId: string): Order | null {
    const o = this.db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order | undefined;
    return o || null;
  }

  public getOrderTimeline(orderId: string): TimelineEvent[] {
    return this.db
      .prepare("SELECT * FROM order_timeline WHERE order_id = ? ORDER BY id ASC")
      .all(orderId) as TimelineEvent[];
  }

  public transitionOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    actorId: string,
    options?: { notes?: string; receivedQuantity?: number }
  ): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Pedido no encontrado: ${orderId}`);
    }

    const currentStatus = order.status;
    if (currentStatus === nextStatus) {
      return order;
    }

    if (currentStatus === "ENTREGADO" || currentStatus === "CANCELADO") {
      throw new Error(`Transición ilegal: Un pedido en estado ${currentStatus} es definitivo y no puede reactivarse.`);
    }

    // Reglas de máquina de estados y permisos por rol de participante
    const isBuyer = order.buyer_id === actorId;
    const isSeller = order.seller_id === actorId;

    if (!isBuyer && !isSeller) {
      throw new Error("No autorizado: Solo el comprador o el vendedor pueden alterar el estado de este pedido.");
    }

    if (nextStatus === "EN_PREPARACION") {
      if (currentStatus !== "CONFIRMADO") {
        throw new Error(`Transición ilegal: No se puede pasar a EN_PREPARACION desde ${currentStatus}.`);
      }
      if (!isSeller) {
        throw new Error("Solo el agricultor vendedor puede marcar el pedido en preparación de cosecha.");
      }
    } else if (nextStatus === "EN_CAMINO") {
      if (currentStatus !== "EN_PREPARACION") {
        throw new Error(`Transición ilegal: No se puede pasar a EN_CAMINO desde ${currentStatus}.`);
      }
      if (!isSeller) {
        throw new Error("Solo el agricultor vendedor puede marcar el pedido en camino.");
      }
    } else if (nextStatus === "ENTREGADO") {
      if (currentStatus !== "EN_CAMINO") {
        throw new Error(`Transición ilegal: No se puede confirmar entrega directamente desde ${currentStatus}. El pedido debe estar primero EN_CAMINO.`);
      }
      if (!isBuyer) {
        throw new Error("Solo el comprador puede confirmar la recepción final del producto.");
      }
    } else if (nextStatus === "CANCELADO") {
      if (!options?.notes) {
        throw new Error("Se requiere una justificación/nota explícita para cancelar un pedido.");
      }
    }

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`
          UPDATE orders
          SET status = ?, received_quantity = ?, reception_notes = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .run(
          nextStatus,
          options?.receivedQuantity !== undefined ? options.receivedQuantity : order.received_quantity || null,
          options?.notes || order.reception_notes || null,
          orderId
        );

      this.db
        .prepare(`
          INSERT INTO order_timeline (order_id, from_status, to_status, actor_id, notes)
          VALUES (?, ?, ?, ?, ?)
        `)
        .run(orderId, currentStatus, nextStatus, actorId, options?.notes || null);
    });

    tx();

    try {
      const recipientId = actorId === order.buyer_id ? order.seller_id : order.buyer_id;
      new NotificationsService(this.db).notify({
        userId: recipientId,
        eventType: "ORDER_STATUS_CHANGED",
        title: `Actualización: Pedido ${order.order_number}`,
        message: `El pedido cambió a estado '${nextStatus}'${options?.notes ? `. Nota: ${options.notes}` : "."}`,
        referenceId: order.id,
        referenceType: "ORDER",
      });
    } catch {}

    return this.getOrderById(orderId)!;
  }

  public listOrdersForUser(userId: string): Order[] {
    return this.db
      .prepare("SELECT * FROM orders WHERE buyer_id = ? OR seller_id = ? ORDER BY created_at DESC")
      .all(userId, userId) as Order[];
  }
}
