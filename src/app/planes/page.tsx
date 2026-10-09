"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PlanItem {
  tier: "EXPLORA" | "VENDEDOR" | "NEGOCIO";
  name: string;
  badgeVariant: "neutral" | "hoja" | "terracota";
  price: string;
  description: string;
  features: string[];
  maxPosts: number;
  maxQuotes: number;
}

const PLANS: PlanItem[] = [
  {
    tier: "EXPLORA",
    name: "Explora (Gratuito)",
    badgeVariant: "neutral",
    price: "RD$ 0 / mes",
    description: "Para pequeños compradores, familias o agricultores que están conociendo el marketplace digital.",
    features: [
      "Capacidad completa para comprar cosechas",
      "1 publicación activa simultánea para vender",
      "Hasta 3 cotizaciones abiertas simultáneas",
      "Verificación básica de identidad/finca disponible sin costo",
      "Soporte y acceso a centro de ayuda y tutoriales",
    ],
    maxPosts: 1,
    maxQuotes: 3,
  },
  {
    tier: "VENDEDOR",
    name: "Vendedor Agrícola",
    badgeVariant: "hoja",
    price: "Sin cobro en MVP",
    description: "Diseñado para productores y parceleros que venden cosechas continuas y buscan compradores directos.",
    features: [
      "Capacidad dual para vender y comprar",
      "Hasta 10 publicaciones activas simultáneas",
      "Hasta 20 cotizaciones abiertas para negociar volúmenes",
      "Perfil de finca y ubicación destacado",
      "Acceso a cotizaciones y demandas mayoristas",
    ],
    maxPosts: 10,
    maxQuotes: 20,
  },
  {
    tier: "NEGOCIO",
    name: "Negocio y Mercado Pro",
    badgeVariant: "terracota",
    price: "Sin cobro en MVP",
    description: "Para asociaciones campesinas, cooperativas, restaurantes, mayoristas y supermercados.",
    features: [
      "Capacidad dual para compras y ventas de alto volumen",
      "Hasta 100 publicaciones activas simultáneas",
      "Hasta 500 cotizaciones simultáneas",
      "Publicación de demandas de compra comercial (B2B)",
      "Atención preferencial de mediación ante incidencias",
    ],
    maxPosts: 100,
    maxQuotes: 500,
  },
];

export default function PlanesPage() {
  const [currentTier, setCurrentTier] = useState<"EXPLORA" | "VENDEDOR" | "NEGOCIO">("VENDEDOR");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSelectPlan = (tier: "EXPLORA" | "VENDEDOR" | "NEGOCIO") => {
    setCurrentTier(tier);
    setFeedbackMessage(`Plan actualizado exitosamente a ${tier}. Conforme al alcance del MVP, no se aplican cargos recurrentes automáticos.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <AppShell>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <Badge variant="bosque">Fase 13: Planes y Permisos</Badge>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#245C3A", marginTop: "0.5rem" }}>
            Planes Transparentes para el Campo
          </h1>
          <p style={{ color: "#4B5A50", maxWidth: "600px", margin: "0.5rem auto 0" }}>
            Límites claros en servidor y en pantalla. En Tecno Cosecha, una misma cuenta te permite tanto comprar como vender productos agrícolas.
          </p>
        </div>

        {/* Notificación de retroalimentación */}
        {feedbackMessage && (
          <div
            style={{
              padding: "1rem",
              background: "#dcfce7",
              border: "1px solid #4D8A62",
              borderRadius: "8px",
              color: "#245C3A",
              fontWeight: "600",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            ✅ {feedbackMessage}
          </div>
        )}

        {/* Políticas fundamentales del sistema */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #DCD6C8",
              borderRadius: "12px",
              padding: "1.25rem",
              borderLeft: "5px solid #245C3A",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#245C3A", marginBottom: "0.35rem" }}>
              🔄 Capacidades Duales (Comprador y Vendedor)
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#4B5A50", margin: 0 }}>
              No necesitas dos cuentas. Si eres productor y quieres comprar insumos o frutos de otra región, tu cuenta lo permite en cualquier plan.
            </p>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #DCD6C8",
              borderRadius: "12px",
              padding: "1.25rem",
              borderLeft: "5px solid #C8754D",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#C8754D", marginBottom: "0.35rem" }}>
              🛡️ Verificación Gratuita de Fincas y Comercios
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#4B5A50", margin: 0 }}>
              La verificación básica de identidad y parcela no está bloqueada por dinero. Usuarios de todos los planes pueden recibir el sello verificado.
            </p>
          </div>
        </div>

        {/* Tarjetas de Planes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            alignItems: "stretch",
          }}
        >
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;

            return (
              <div
                key={plan.tier}
                style={{
                  background: "#FFFFFF",
                  border: isCurrent ? "2px solid #245C3A" : "1px solid #DCD6C8",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: isCurrent ? "0 4px 14px rgba(36, 92, 58, 0.12)" : "none",
                  position: "relative",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <Badge variant={plan.badgeVariant}>{plan.name}</Badge>
                    {isCurrent && <Badge variant="bosque">✓ Tu Plan Activo</Badge>}
                  </div>

                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#253129", margin: "0.75rem 0 0.25rem" }}>
                    {plan.price}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#4B5A50", marginBottom: "1.25rem" }}>
                    {plan.description}
                  </p>

                  <div style={{ borderTop: "1px solid #EFECE1", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#245C3A", marginBottom: "0.5rem" }}>
                      Límites Validados por el Servidor:
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "#253129" }}>
                      <li style={{ marginBottom: "0.4rem" }}>
                        📌 <strong>{plan.maxPosts}</strong> {plan.maxPosts === 1 ? "publicación activa" : "publicaciones activas"}
                      </li>
                      <li style={{ marginBottom: "0.75rem" }}>
                        🤝 <strong>{plan.maxQuotes}</strong> cotizaciones simultáneas
                      </li>
                    </ul>

                    <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#245C3A", marginBottom: "0.5rem" }}>
                      Beneficios Incluidos:
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "#4B5A50" }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ marginBottom: "0.4rem", display: "flex", gap: "0.4rem" }}>
                          <span style={{ color: "#245C3A" }}>✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <Button variant="secondary" fullWidth disabled>
                      Plan Actual Activo
                    </Button>
                  ) : (
                    <Button
                      variant={plan.tier === "NEGOCIO" ? "terracotta" : "primary"}
                      fullWidth
                      onClick={() => handleSelectPlan(plan.tier)}
                    >
                      Seleccionar {plan.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Aviso de Transparencia */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1rem 1.25rem",
            background: "#FAF8F2",
            border: "1px solid #DCD6C8",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#4B5A50",
            textAlign: "center",
          }}
        >
          <strong>Aviso de Gobernanza Técnica:</strong> Conforme al alcance acordado, no existen suscripciones bancarias automáticas ni cargos ocultos en tarjeta. Cualquier cambio de plan opera sin intermediarios financieros en este corte.
        </div>
      </div>
    </AppShell>
  );
}
