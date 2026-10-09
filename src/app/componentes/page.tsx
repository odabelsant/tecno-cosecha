"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/StateView";

export default function ComponentesShowcasePage() {
  const [activeTab, setActiveTab] = useState<"loading" | "empty" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-texto)", margin: "0 0 6px 0" }}>
          🎨 Galería de Componentes y Sistema Visual
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.95rem" }}>
          Verificación interactiva de tokens, componentes accesibles y estados estándar (Fase 04).
        </p>
      </header>

      {/* 1. Muestra de Paleta Canónica */}
      <Card title="1. Paleta Canónica de Colores" subtitle="Contraste y legibilidad auditados (WCAG 2.1)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginTop: "12px" }}>
          <div style={{ backgroundColor: "#245C3A", color: "#FFFFFF", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            <strong>Verde Bosque</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>#245C3A</div>
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Primario / Barra</div>
          </div>
          <div style={{ backgroundColor: "#4D8A62", color: "#FFFFFF", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            <strong>Verde Hoja</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>#4D8A62</div>
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Secundario / Acento</div>
          </div>
          <div style={{ backgroundColor: "#C8754D", color: "#FFFFFF", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            <strong>Terracota</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>#C8754D</div>
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Llamada a la Acción</div>
          </div>
          <div style={{ backgroundColor: "#F7F5EC", color: "#253129", border: "1px solid #DCD6C8", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            <strong>Crema</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>#F7F5EC</div>
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Fondo Principal</div>
          </div>
          <div style={{ backgroundColor: "#253129", color: "#F7F5EC", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            <strong>Texto Oscuro</strong>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>#253129</div>
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Alto Contraste</div>
          </div>
        </div>
      </Card>

      {/* 2. Botones Grandes y Variantes */}
      <Card title="2. Botones Accesibles" subtitle="Touch targets grandes (min 48px) con etiquetas explícitas">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="primary" size="large">
              🌲 Botón Primario (Verde Bosque)
            </Button>
            <Button variant="secondary" size="large">
              🍃 Botón Secundario (Verde Hoja)
            </Button>
            <Button variant="terracotta" size="large">
              🏺 Botón Destacado (Terracota)
            </Button>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="outline" size="medium">
              📄 Botón Contorno
            </Button>
            <Button variant="primary" size="medium" disabled>
              🔒 Botón Deshabilitado
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Formulario y Validación de Errores */}
      <Card title="3. Campos de Entrada (FormField)" subtitle="Etiquetas explícitas, ayuda contextual y roles de alerta">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          <FormField
            id="demo-nombre"
            label="Nombre Completo"
            placeholder="Ejemplo: Juan Pérez"
            required
            helperText="Texto de ayuda claro para guiar al usuario."
          />
          <FormField
            id="demo-error"
            label="Teléfono de Contacto"
            placeholder="809-555-0100"
            required
            error="El número de teléfono debe incluir código de área (809/829/849)."
            defaultValue="555"
          />
        </div>
      </Card>

      {/* 4. Badges y Etiquetas */}
      <Card title="4. Badges y Estados Visuales" subtitle="Etiquetas de categoría y condición">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
          <Badge variant="bosque">Tubérculos</Badge>
          <Badge variant="hoja">Cosechado / Listo</Badge>
          <Badge variant="terracota">Preventa</Badge>
          <Badge variant="neutral">Unidad: Quintal (qq)</Badge>
        </div>
      </Card>

      {/* 5. Auditoría de Estados Canónicos: Carga, Vacío, Error */}
      <Card title="5. Estados Canónicos del Sistema" subtitle="Interactúa para auditar vistas de carga, vacío y error">
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setActiveTab("loading")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: activeTab === "loading" ? "2px solid var(--color-verde-bosque)" : "1px solid var(--color-border)",
              background: activeTab === "loading" ? "var(--color-verde-bosque)" : "#FFFFFF",
              color: activeTab === "loading" ? "#FFFFFF" : "var(--color-texto)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⏳ Estado: Cargando
          </button>
          <button
            onClick={() => setActiveTab("empty")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: activeTab === "empty" ? "2px solid var(--color-verde-bosque)" : "1px solid var(--color-border)",
              background: activeTab === "empty" ? "var(--color-verde-bosque)" : "#FFFFFF",
              color: activeTab === "empty" ? "#FFFFFF" : "var(--color-texto)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🌾 Estado: Vacío
          </button>
          <button
            onClick={() => setActiveTab("error")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: activeTab === "error" ? "2px solid var(--color-error)" : "1px solid var(--color-border)",
              background: activeTab === "error" ? "var(--color-error)" : "#FFFFFF",
              color: activeTab === "error" ? "#FFFFFF" : "var(--color-texto)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⚠️ Estado: Error
          </button>
        </div>

        {activeTab === "loading" && (
          <LoadingState message="Cargando cosechas del Cibao Central..." />
        )}

        {activeTab === "empty" && (
          <EmptyState
            title="No se encontraron productos en esta categoría"
            description="Actualmente no hay productores con lotes de cosecha activos en esta categoría. Puedes explorar otras secciones o publicar un lote."
            actionText="🌱 Registrar Nueva Cosecha"
            onAction={() => alert("Acción de estado vacío ejecutada")}
          />
        )}

        {activeTab === "error" && (
          <ErrorState
            title="Error de Conexión en el Campo"
            message={`No fue posible sincronizar el inventario con el servidor debido a baja señal de red. Intentos realizados: ${retryCount}`}
            onRetry={() => setRetryCount((prev) => prev + 1)}
          />
        )}
      </Card>
    </div>
  );
}
