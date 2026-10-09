"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, LoadingState } from "@/components/ui/StateView";
import { Button } from "@/components/ui/Button";

interface PostItem {
  id: string;
  post_type: "OFERTA" | "DEMANDA";
  title: string;
  variety?: string;
  description?: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  province: string;
  municipality: string;
  target_date: string;
  image_url?: string;
}

function getCropImage(post: PostItem): string {
  if (post.image_url && post.image_url.trim().length > 0) {
    return post.image_url;
  }
  const t = post.title.toLowerCase();
  if (t.includes("tomate")) return "/images/crops/tomate.svg";
  if (t.includes("zanahoria")) return "/images/crops/zanahoria.svg";
  if (t.includes("habichuela") || t.includes("guandul") || t.includes("grano")) return "/images/crops/habichuela.svg";
  if (t.includes("plátano") || t.includes("platano")) return "/images/crops/platano.svg";
  if (t.includes("mango")) return "/images/crops/mango.svg";
  if (t.includes("cebolla")) return "/images/crops/cebolla.svg";
  if (t.includes("ají") || t.includes("aji")) return "/images/crops/aji.svg";
  if (t.includes("yuca")) return "/images/crops/yuca.svg";
  if (t.includes("batata")) return "/images/crops/batata.svg";
  if (t.includes("aguacate")) return "/images/crops/aguacate.svg";
  if (t.includes("chinola")) return "/images/crops/chinola.svg";
  return "/images/crops/default.svg";
}

export default function CatalogoDiscoveryPage() {
  const [viewType, setViewType] = useState<"ALL" | "OFERTA" | "DEMANDA">("ALL");
  const [category, setCategory] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [explanation, setExplanation] = useState<string>("");

  const categories = [
    { id: "TODOS", label: "Todas las Categorías" },
    { id: "cat_tuberculos", label: "🥔 Tubérculos" },
    { id: "cat_vegetales", label: "🍅 Vegetales" },
    { id: "cat_frutas", label: "🥑 Frutas" },
    { id: "cat_granos", label: "🫘 Granos" },
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (viewType !== "ALL") params.append("post_type", viewType);
    if (category !== "TODOS") params.append("category_id", category);
    if (searchQuery.trim()) params.append("query", searchQuery.trim());

    try {
      const res = await fetch(`/api/publications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.items || []);
        setExplanation(data.explanation || "");
      }
    } catch {
      setPosts([]);
      setExplanation("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [viewType, category, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleClearFilters = () => {
    setViewType("ALL");
    setCategory("TODOS");
    setSearchQuery("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-texto)", margin: "0 0 6px 0" }}>
          📦 Mercado y Descubrimiento Agrícola
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.95rem" }}>
          Explora ofertas de cosecha y demandas de compra directamente en el campo dominicano.
        </p>
      </header>

      {/* Selector de Vistas: General | Comprar (Ofertas) | Vender (Demandas) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          backgroundColor: "#EFECE1",
          padding: "6px",
          borderRadius: "var(--radius-md)",
        }}
        role="tablist"
        aria-label="Vistas del mercado"
      >
        <button
          onClick={() => setViewType("ALL")}
          role="tab"
          aria-selected={viewType === "ALL"}
          style={{
            padding: "10px 4px",
            border: "none",
            borderRadius: "var(--radius-sm)",
            backgroundColor: viewType === "ALL" ? "var(--color-verde-bosque)" : "transparent",
            color: viewType === "ALL" ? "#FFFFFF" : "var(--color-texto)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          🌐 General
        </button>
        <button
          onClick={() => setViewType("OFERTA")}
          role="tab"
          aria-selected={viewType === "OFERTA"}
          style={{
            padding: "10px 4px",
            border: "none",
            borderRadius: "var(--radius-sm)",
            backgroundColor: viewType === "OFERTA" ? "var(--color-verde-bosque)" : "transparent",
            color: viewType === "OFERTA" ? "#FFFFFF" : "var(--color-texto)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          🛒 Comprar (Ofertas)
        </button>
        <button
          onClick={() => setViewType("DEMANDA")}
          role="tab"
          aria-selected={viewType === "DEMANDA"}
          style={{
            padding: "10px 4px",
            border: "none",
            borderRadius: "var(--radius-sm)",
            backgroundColor: viewType === "DEMANDA" ? "var(--color-verde-bosque)" : "transparent",
            color: viewType === "DEMANDA" ? "#FFFFFF" : "var(--color-texto)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          🌾 Vender (Demandas)
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros Combinados */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Buscar producto, variedad o palabra clave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: "240px",
            minHeight: "var(--touch-target-min)",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "#FFFFFF",
            fontSize: "1rem",
          }}
        />
        <Button type="submit" variant="primary" size="large">
          🔍 Buscar
        </Button>
        {(searchQuery || category !== "TODOS" || viewType !== "ALL") && (
          <Button type="button" variant="outline" size="large" onClick={handleClearFilters}>
            ✕ Limpiar
          </Button>
        )}
      </form>

      {/* Carrusel de Categorías Rápidas */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-full)",
              border: category === c.id ? "2px solid var(--color-verde-bosque)" : "1px solid var(--color-border)",
              backgroundColor: category === c.id ? "var(--color-verde-bosque)" : "#FFFFFF",
              color: category === c.id ? "#FFFFFF" : "var(--color-texto)",
              fontWeight: 700,
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Resultados de Descubrimiento */}
      {loading ? (
        <LoadingState message="Buscando en el mercado agrícola..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No se encontraron publicaciones con estos filtros"
          description={explanation}
          actionText="Limpiar Filtros y Ver Todo"
          onAction={handleClearFilters}
        />
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {posts.map((post) => {
            const cropImg = getCropImage(post);

            return (
              <Card key={post.id}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  {/* Fotografía / Miniatura Representativa */}
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      minWidth: "110px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#FAF9F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={cropImg}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/crops/default.svg";
                      }}
                    />
                  </div>

                  {/* Información Principal del Lote */}
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "6px" }}>
                      <div>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                          <Badge variant={post.post_type === "OFERTA" ? "bosque" : "terracota"}>
                            {post.post_type === "OFERTA" ? "🛒 Cosecha en Venta" : "📢 Necesidad de Compra"}
                          </Badge>
                          <Badge variant="neutral">Unidad: {post.unit}</Badge>
                        </div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-texto)", margin: 0 }}>
                          {post.title}
                        </h2>
                        {post.variety && (
                          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                            Variedad: {post.variety}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-verde-bosque)" }}>
                          RD$ {post.price_per_unit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          por {post.unit}
                        </span>
                      </div>
                    </div>

                    {post.description && (
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: "6px 0 12px 0" }}>
                        {post.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: "10px",
                        fontSize: "0.85rem",
                        color: "var(--color-text-muted)",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <span>📍 {post.province}, {post.municipality}</span>
                      <span>📦 Cantidad: <strong>{post.quantity} {post.unit}</strong></span>
                      <span>📅 Fecha: {post.target_date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
