import Database from "better-sqlite3";
import { getDatabase } from "@/db/connection";
import { AgriculturalUnit, AGRICULTURAL_UNITS } from "@/modules/catalog/units";
import { NotificationsService } from "@/modules/notifications/service";

export type QuoteStatus = "PENDIENTE" | "CONTRAPROPUESTA" | "ACEPTADA" | "RECHAZADA" | "VENCIDA";
export type DeliveryMode = "RETIRO_FINCA" | "PUNTO_ACOPIO" | "ENTREGA_VENDEDOR";

export interface Quote {
  id: string;
  post_id: string;
  buyer_id: string;
  seller_id: string;
  proposed_by: string;
  quantity: number;
  unit: AgriculturalUnit;
  price_per_unit: number;
  quality_spec?: string;
  delivery_mode: DeliveryMode;
  delivery_location: string;
  target_date: string;
  expires_at: string;
  status: QuoteStatus;
  version: number;
  parent_quote_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteDTO {
  id: string;
  post_id: string;
  seller_id: string;
  quantity: number;
  unit: AgriculturalUnit;
  price_per_unit: number;
  quality_spec?: string;
  delivery_mode: DeliveryMode;
  delivery_location: string;
  target_date: string;
  expires_at: string;
  notes?: string;
}

export interface CounterQuoteDTO {
  id: string;
  quantity?: number;
  price_per_unit?: number;
  quality_spec?: string;
  delivery_mode?: DeliveryMode;
  delivery_location?: string;
  target_date?: string;
  expires_at?: string;
  notes?: string;
}

export class QuotesService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  public createQuote(dto: CreateQuoteDTO, buyerId: string): Quote {
    if (!buyerId) {
      throw new Error("No autenticado: Se requiere un comprador válido.");
    }
    if (dto.quantity <= 0) {
      throw new Error("La cantidad solicitada debe ser mayor que cero.");
    }
    if (dto.price_per_unit <= 0) {
      throw new Error("El precio unitario propuesto debe ser mayor que cero.");
    }
    if (!AGRICULTURAL_UNITS[dto.unit]) {
      throw new Error(`Unidad agrícola no permitida: ${dto.unit}`);
    }

    // Verificar que la fecha de vencimiento sea futura
    if (new Date(dto.expires_at) <= new Date()) {
      throw new Error("La fecha de vencimiento de la cotización debe ser en el futuro.");
    }

    this.db
      .prepare(`
        INSERT INTO quotes (
          id, post_id, buyer_id, seller_id, proposed_by, quantity, unit,
          price_per_unit, quality_spec, delivery_mode, delivery_location,
          target_date, expires_at, status, version, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', 1, ?)
      `)
      .run(
        dto.id,
        dto.post_id,
        buyerId,
        dto.seller_id,
        buyerId,
        dto.quantity,
        dto.unit,
        dto.price_per_unit,
        dto.quality_spec || null,
        dto.delivery_mode,
        dto.delivery_location,
        dto.target_date,
        dto.expires_at,
        dto.notes || null
      );

    try {
      new NotificationsService(this.db).notify({
        userId: dto.seller_id,
        eventType: "QUOTE_RECEIVED",
        title: "Nueva solicitud de cotización recibida",
        message: `Has recibido una cotización por ${dto.quantity} ${dto.unit} a RD$ ${dto.price_per_unit} c/u.`,
        referenceId: dto.id,
        referenceType: "QUOTE",
      });
    } catch {
      // Tolera tests unitarios que aíslen tablas
    }

    return this.getQuoteById(dto.id)!;
  }

  public getQuoteById(quoteId: string): Quote | null {
    const q = this.db.prepare("SELECT * FROM quotes WHERE id = ?").get(quoteId) as Quote | undefined;
    if (!q) return null;

    // Comprobación de caducidad automática
    if (q.status === "PENDIENTE" && new Date(q.expires_at) < new Date()) {
      this.db.prepare("UPDATE quotes SET status = 'VENCIDA' WHERE id = ?").run(quoteId);
      q.status = "VENCIDA";
    }

    return q;
  }

  public counterQuote(parentQuoteId: string, dto: CounterQuoteDTO, actorId: string): Quote {
    const parent = this.getQuoteById(parentQuoteId);
    if (!parent) {
      throw new Error(`Cotización no encontrada: ${parentQuoteId}`);
    }

    if (parent.status === "ACEPTADA") {
      throw new Error("Regla de integridad: No se puede hacer contrapropuesta sobre una cotización ya aceptada.");
    }
    if (parent.status === "RECHAZADA" || parent.status === "VENCIDA") {
      throw new Error(`No se puede responder a una cotización en estado ${parent.status}.`);
    }

    // Solo las partes involucradas pueden responder
    const isBuyer = parent.buyer_id === actorId;
    const isSeller = parent.seller_id === actorId;
    if (!isBuyer && !isSeller) {
      throw new Error("No autorizado: Solo el comprador o vendedor pueden responder a esta cotización.");
    }

    const quantity = dto.quantity !== undefined ? dto.quantity : parent.quantity;
    const price_per_unit = dto.price_per_unit !== undefined ? dto.price_per_unit : parent.price_per_unit;
    const quality_spec = dto.quality_spec !== undefined ? dto.quality_spec : parent.quality_spec;
    const delivery_mode = dto.delivery_mode !== undefined ? dto.delivery_mode : parent.delivery_mode;
    const delivery_location = dto.delivery_location !== undefined ? dto.delivery_location : parent.delivery_location;
    const target_date = dto.target_date !== undefined ? dto.target_date : parent.target_date;
    const expires_at = dto.expires_at !== undefined ? dto.expires_at : parent.expires_at;

    const tx = this.db.transaction(() => {
      // 1. Marcar cotización padre como CONTRAPROPUESTA
      this.db.prepare("UPDATE quotes SET status = 'CONTRAPROPUESTA' WHERE id = ?").run(parentQuoteId);

      // 2. Crear cotización hija versionada
      this.db
        .prepare(`
          INSERT INTO quotes (
            id, post_id, buyer_id, seller_id, proposed_by, quantity, unit,
            price_per_unit, quality_spec, delivery_mode, delivery_location,
            target_date, expires_at, status, version, parent_quote_id, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?)
        `)
        .run(
          dto.id,
          parent.post_id,
          parent.buyer_id,
          parent.seller_id,
          actorId,
          quantity,
          parent.unit,
          price_per_unit,
          quality_spec || null,
          delivery_mode,
          delivery_location,
          target_date,
          expires_at,
          parent.version + 1,
          parentQuoteId,
          dto.notes || null
        );
    });

    tx();

    try {
      const recipientId = actorId === parent.buyer_id ? parent.seller_id : parent.buyer_id;
      new NotificationsService(this.db).notify({
        userId: recipientId,
        eventType: "QUOTE_COUNTERED",
        title: "Nueva contrapropuesta recibida",
        message: `Se ha recibido una contrapropuesta (v${parent.version + 1}) por ${quantity} ${parent.unit} a RD$ ${price_per_unit} c/u.`,
        referenceId: dto.id,
        referenceType: "QUOTE",
      });
    } catch {}

    return this.getQuoteById(dto.id)!;
  }

  public acceptQuote(quoteId: string, actorId: string): Quote {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Cotización no encontrada: ${quoteId}`);
    }

    if (quote.status === "ACEPTADA") {
      throw new Error("Esta cotización ya fue aceptada previamente.");
    }
    if (quote.status !== "PENDIENTE") {
      throw new Error(`No se puede aceptar una cotización en estado ${quote.status}.`);
    }

    // Regla de negocio: No puedes autoaceptar tu propia propuesta
    if (quote.proposed_by === actorId) {
      throw new Error("Regla de integridad: No puedes autoaceptar una propuesta que tú mismo redactaste.");
    }

    // Solo la contraparte puede aceptar
    const isCounterpart =
      (quote.proposed_by === quote.buyer_id && actorId === quote.seller_id) ||
      (quote.proposed_by === quote.seller_id && actorId === quote.buyer_id);

    if (!isCounterpart) {
      throw new Error("No autorizado: Solo la contraparte de la negociación puede aceptar la propuesta.");
    }

    this.db.prepare("UPDATE quotes SET status = 'ACEPTADA', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(quoteId);

    try {
      new NotificationsService(this.db).notify({
        userId: quote.proposed_by,
        eventType: "QUOTE_ACCEPTED",
        title: "¡Cotización Aceptada!",
        message: `Tu propuesta para ${quote.quantity} ${quote.unit} ha sido formalmente aceptada. Ya puede generarse el pedido.`,
        referenceId: quote.id,
        referenceType: "QUOTE",
      });
    } catch {}

    return this.getQuoteById(quoteId)!;
  }

  public rejectQuote(quoteId: string, actorId: string, reason?: string): Quote {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Cotización no encontrada: ${quoteId}`);
    }

    if (quote.status === "ACEPTADA") {
      throw new Error("Regla de integridad: Una cotización formalmente aceptada no puede ser rechazada silenciosamente.");
    }

    const isParty = quote.buyer_id === actorId || quote.seller_id === actorId;
    if (!isParty) {
      throw new Error("No autorizado: Solo el comprador o el vendedor pueden rechazar la propuesta.");
    }

    this.db
      .prepare("UPDATE quotes SET status = 'RECHAZADA', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(reason || quote.notes || null, quoteId);

    return this.getQuoteById(quoteId)!;
  }
}
