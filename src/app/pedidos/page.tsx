"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/StateView";

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState<"activos" | "historial">("activos");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-texto)", margin: "0 0 6px 0" }}>
          📋 Gestión de Pedidos y Cumplimiento
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.95rem" }}>
          Seguimiento de pedidos acordados, evidencia de entrega y resolución de incidencias (Fases 10, 11 y 12).
        </p>
      </header>

      {/* Selector de pestañas */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("activos")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: activeTab === "activos" ? "2px solid var(--color-verde-bosque)" : "1px solid var(--color-border)",
            background: activeTab === "activos" ? "var(--color-verde-bosque)" : "#FFFFFF",
            color: activeTab === "activos" ? "#FFFFFF" : "var(--color-texto)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📦 Pedidos Activos en Curso
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: activeTab === "historial" ? "2px solid var(--color-verde-bosque)" : "1px solid var(--color-border)",
            background: activeTab === "historial" ? "var(--color-verde-bosque)" : "#FFFFFF",
            color: activeTab === "historial" ? "#FFFFFF" : "var(--color-texto)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📜 Historial y Entregas Completadas
        </button>
      </div>

      {/* Flujo de Estados del Pedido (Guía Visual) */}
      <Card title="Ciclo de Cumplimiento Transaccional" subtitle="Trazabilidad inmutable sin pasarelas automáticas (ADR-004)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          <div style={{ background: "#F1F5F9", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
            <Badge variant="bosque">1. Confirmado</Badge>
            <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "var(--color-text-muted)" }}>Cotización aceptada</div>
          </div>
          <div style={{ background: "#F1F5F9", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
            <Badge variant="hoja">2. Preparación</Badge>
            <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "var(--color-text-muted)" }}>Cosecha y empaque</div>
          </div>
          <div style={{ background: "#F1F5F9", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
            <Badge variant="terracota">3. En Camino</Badge>
            <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "var(--color-text-muted)" }}>Ruta o punto acopio</div>
          </div>
          <div style={{ background: "#F1F5F9", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
            <Badge variant="bosque">4. Entregado</Badge>
            <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "var(--color-text-muted)" }}>Recepción e inspección</div>
          </div>
        </div>
      </Card>

      {/* Estado Vacío Auténtico */}
      <EmptyState
        title={activeTab === "activos" ? "No tienes pedidos en curso en este momento" : "No hay pedidos archivados"}
        description="Cuando aceptes una cotización de compra o un productor acepte tu oferta, el pedido formalizado aparecerá aquí con su cronología de entrega."
        actionText="🌾 Explorar Cosechas en Catálogo"
        actionHref="/catalogo"
      />
    </div>
  );
}
