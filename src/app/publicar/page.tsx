"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export default function PublicarPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-texto)", margin: "0 0 6px 0" }}>
          📝 Publicar Cosecha
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.95rem" }}>
          Formulario base para que los productores registren lotes de siembra y cosecha.
        </p>
      </header>

      <Card title="Datos de la Cosecha" subtitle="Todos los campos marcados con (*) son obligatorios">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          style={{ display: "flex", flexDirection: "column", gap: "4px" }}
        >
          <FormField
            id="producto-titulo"
            label="Nombre del Producto"
            placeholder="Ejemplo: Plátano Macho Criollo"
            required
            helperText="Indica el nombre común y variedad del producto cosechado."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="categoria-select" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                Categoría <span style={{ color: "var(--color-terracota)" }}>*</span>
              </label>
              <select
                id="categoria-select"
                required
                style={{
                  minHeight: "var(--touch-target-min)",
                  padding: "10px 14px",
                  fontSize: "1rem",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <option value="tuberculos">Tubérculos y Raíces</option>
                <option value="vegetales">Hortalizas y Vegetales</option>
                <option value="frutas">Frutas Tropicales</option>
                <option value="granos">Granos y Legumbres</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="unidad-select" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                Unidad de Medida <span style={{ color: "var(--color-terracota)" }}>*</span>
              </label>
              <select
                id="unidad-select"
                required
                style={{
                  minHeight: "var(--touch-target-min)",
                  padding: "10px 14px",
                  fontSize: "1rem",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <option value="lb">Libra (lb)</option>
                <option value="qq">Quintal (qq = 100 lb)</option>
                <option value="cien">Cien (100 unidades)</option>
                <option value="saco">Saco</option>
                <option value="caja">Caja / Huacal</option>
                <option value="kg">Kilogramo (kg)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <FormField
              id="cantidad-stock"
              type="number"
              label="Cantidad Disponible (Stock)"
              placeholder="Ej: 50"
              required
              helperText="Volumen total que tienes disponible para entregar."
            />
            <FormField
              id="precio-unitario"
              type="number"
              label="Precio por Unidad (RD$)"
              placeholder="Ej: 25.00"
              required
              helperText="Precio en pesos dominicanos por la unidad seleccionada."
            />
          </div>

          <FormField
            id="ubicacion-finca"
            label="Ubicación de la Finca"
            placeholder="Ejemplo: La Vega, Sector Cutupú"
            required
            helperText="Provincia y sector para coordinar la entrega o retiro."
          />

          <div style={{ marginTop: "16px" }}>
            <Button type="submit" variant="primary" size="large" fullWidth>
              🌱 Guardar y Publicar Cosecha
            </Button>
          </div>

          {submitted && (
            <div
              role="status"
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                backgroundColor: "var(--color-success-bg)",
                color: "var(--color-success)",
                border: "1px solid #86EFAC",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              ✅ Formulario validado correctamente (Shell visual interactivo sin persistencia aún).
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
