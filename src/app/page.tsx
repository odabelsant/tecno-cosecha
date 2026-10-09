import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Hero Banner Móvil Primero */}
      <section
        style={{
          backgroundColor: "var(--color-verde-bosque)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          padding: "28px 20px",
          boxShadow: "0 4px 12px rgba(36, 92, 58, 0.15)",
        }}
      >
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <Badge variant="terracota">Campo Dominicano</Badge>
          <Badge variant="hoja">Directo del Productor</Badge>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.25 }}>
          Conectando el campo con los negocios y hogares
        </h1>
        <p style={{ fontSize: "1rem", color: "#F7F5EC", margin: "0 0 24px 0", maxWidth: "540px" }}>
          Compra y vende plátanos, vegetales, frutas y granos sin intermediarios innecesarios. Precios claros y acuerdos directos.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/catalogo" style={{ textDecoration: "none" }}>
            <Button variant="terracotta" size="large" fullWidth>
              📦 Explorar Cosechas Disponibles
            </Button>
          </Link>
          <Link href="/publicar" style={{ textDecoration: "none" }}>
            <Button variant="outline" size="large" fullWidth style={{ color: "#FFFFFF", borderColor: "#FFFFFF" }}>
              📝 Publicar mi Cosecha (Productores)
            </Button>
          </Link>
        </div>
      </section>

      {/* Categorías Agrícolas Oficiales (ADR / Fase 02) */}
      <Card title="Categorías del Campo Dominicano" subtitle="Productos frescos de alta rotación">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <div style={{ background: "var(--color-crema)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "4px" }} aria-hidden="true">🥔</div>
            <strong style={{ fontSize: "0.95rem", color: "var(--color-texto)" }}>Tubérculos</strong>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>Plátano, Yuca, Batata</p>
          </div>
          <div style={{ background: "var(--color-crema)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "4px" }} aria-hidden="true">🍅</div>
            <strong style={{ fontSize: "0.95rem", color: "var(--color-texto)" }}>Vegetales</strong>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>Tomate, Cebolla, Ají</p>
          </div>
          <div style={{ background: "var(--color-crema)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "4px" }} aria-hidden="true">🥑</div>
            <strong style={{ fontSize: "0.95rem", color: "var(--color-texto)" }}>Frutas</strong>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>Aguacate, Mango, Limón</p>
          </div>
          <div style={{ background: "var(--color-crema)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "4px" }} aria-hidden="true">🫘</div>
            <strong style={{ fontSize: "0.95rem", color: "var(--color-texto)" }}>Granos</strong>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>Habichuelas, Guandules</p>
          </div>
        </div>
      </Card>

      {/* Auditoría Visual del Sistema */}
      <Card title="Gobernanza y Sistema Visual" subtitle="Base técnica Fase 04">
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: "0 0 16px 0" }}>
          Esta interfaz implementa el sistema de diseño canónico con paleta accesible (#245C3A, #4D8A62, #C8754D, #F7F5EC) y soporte para estados vacíos, de carga y de error.
        </p>
        <Link href="/componentes" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="medium">
            🎨 Ver Galería de Componentes y Estados
          </Button>
        </Link>
      </Card>
    </div>
  );
}
