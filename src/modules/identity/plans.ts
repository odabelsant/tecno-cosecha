import Database from "better-sqlite3";
import crypto from "crypto";
import { getDatabase } from "@/db/connection";

export type PlanTier = "EXPLORA" | "VENDEDOR" | "NEGOCIO";

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  description: string;
  maxActivePosts: number;
  maxActiveQuotes: number;
  canSell: boolean;
  canBuy: boolean;
  allowB2BDemands: boolean;
  monthlyCostRD: number;
}

export const PLAN_DEFINITIONS: Record<PlanTier, PlanLimits> = {
  EXPLORA: {
    tier: "EXPLORA",
    name: "Explora (Gratuito)",
    description: "Ideal para consumidores, familias o productores que inician. Compra y venta directa con hasta 1 publicación activa y 3 cotizaciones simultáneas.",
    maxActivePosts: 1,
    maxActiveQuotes: 3,
    canSell: true,
    canBuy: true,
    allowB2BDemands: false,
    monthlyCostRD: 0,
  },
  VENDEDOR: {
    tier: "VENDEDOR",
    name: "Vendedor Agrícola",
    description: "Diseñado para productores y parceleros del campo. Hasta 10 publicaciones activas simultáneas y 20 cotizaciones abiertas para mover cosechas completas.",
    maxActivePosts: 10,
    maxActiveQuotes: 20,
    canSell: true,
    canBuy: true,
    allowB2BDemands: true,
    monthlyCostRD: 0, // En MVP sin cobro automático recurrente
  },
  NEGOCIO: {
    tier: "NEGOCIO",
    name: "Negocio y Mercado Profesional",
    description: "Para cooperativas, restaurantes, mayoristas y comercios. Publicaciones y cotizaciones para compras y ventas de alto volumen.",
    maxActivePosts: 100,
    maxActiveQuotes: 500,
    canSell: true,
    canBuy: true,
    allowB2BDemands: true,
    monthlyCostRD: 0, // En MVP sin cobro automático recurrente
  },
};

export interface UserSubscriptionRecord {
  id: string;
  user_id: string;
  plan_tier: PlanTier;
  is_verified: number;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionWithLimits extends UserSubscriptionRecord {
  limits: PlanLimits;
}

export class PlanLimitExceededError extends Error {
  public readonly code = "PLAN_LIMIT_EXCEEDED";
  public readonly tier: PlanTier;
  public readonly limit: number;
  public readonly resource: string;

  constructor(resource: string, tier: PlanTier, limit: number) {
    super(
      `Límite de plan ${tier} excedido: no se pueden tener más de ${limit} ${resource} activas simultáneas. Actualice su plan a un nivel superior.`
    );
    this.name = "PlanLimitExceededError";
    this.tier = tier;
    this.limit = limit;
    this.resource = resource;
  }
}

export class SubscriptionsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  /**
   * Obtiene la suscripción de un usuario.
   * Si el usuario aún no tiene registro, crea automáticamente el plan base EXPLORA.
   */
  public getUserSubscription(userId: string): UserSubscriptionWithLimits {
    let row = this.db
      .prepare("SELECT * FROM user_subscriptions WHERE user_id = ?")
      .get(userId) as UserSubscriptionRecord | undefined;

    if (!row) {
      const id = "sub_" + crypto.randomUUID().slice(0, 8);
      this.db
        .prepare(`
          INSERT INTO user_subscriptions (id, user_id, plan_tier, is_verified)
          VALUES (?, ?, 'EXPLORA', 0)
        `)
        .run(id, userId);

      row = this.db
        .prepare("SELECT * FROM user_subscriptions WHERE user_id = ?")
        .get(userId) as UserSubscriptionRecord;
    }

    return {
      ...row,
      limits: PLAN_DEFINITIONS[row.plan_tier],
    };
  }

  /**
   * Cambia el plan de suscripción de un usuario.
   * En el MVP no realiza cobros recurrentes automáticos.
   */
  public updatePlan(userId: string, targetTier: PlanTier): UserSubscriptionWithLimits {
    if (!PLAN_DEFINITIONS[targetTier]) {
      throw new Error(`Plan no válido: ${targetTier}`);
    }

    // Asegurar que exista primero
    this.getUserSubscription(userId);

    this.db
      .prepare(`
        UPDATE user_subscriptions
        SET plan_tier = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `)
      .run(targetTier, userId);

    return this.getUserSubscription(userId);
  }

  /**
   * Actualiza el estado de verificación de identidad/finca.
   * REGLA CANÓNICA: La verificación básica NUNCA está bloqueada por no pagar;
   * cualquier usuario (incluso en EXPLORA) puede ser verificado.
   */
  public setVerificationStatus(
    userId: string,
    isVerified: boolean,
    notes?: string
  ): UserSubscriptionWithLimits {
    this.getUserSubscription(userId);

    this.db
      .prepare(`
        UPDATE user_subscriptions
        SET is_verified = ?, verification_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `)
      .run(isVerified ? 1 : 0, notes || null, userId);

    return this.getUserSubscription(userId);
  }

  /**
   * Valida en el SERVIDOR si el usuario puede crear una nueva publicación activa.
   * "Ocultar un botón no constituye autorización".
   */
  public assertCanCreatePost(userId: string, currentActivePostsCount: number): void {
    const sub = this.getUserSubscription(userId);
    if (currentActivePostsCount >= sub.limits.maxActivePosts) {
      throw new PlanLimitExceededError("publicaciones", sub.plan_tier, sub.limits.maxActivePosts);
    }
  }

  /**
   * Valida en el SERVIDOR si el usuario puede crear o mantener una nueva cotización activa.
   */
  public assertCanCreateQuote(userId: string, currentActiveQuotesCount: number): void {
    const sub = this.getUserSubscription(userId);
    if (currentActiveQuotesCount >= sub.limits.maxActiveQuotes) {
      throw new PlanLimitExceededError("cotizaciones", sub.plan_tier, sub.limits.maxActiveQuotes);
    }
  }

  /**
   * Retorna el catálogo completo de planes vigentes.
   */
  public getAvailablePlans(): PlanLimits[] {
    return Object.values(PLAN_DEFINITIONS);
  }
}
