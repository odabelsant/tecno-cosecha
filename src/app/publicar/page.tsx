"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// Extensiones y tipos MIME soportados oficialmente
const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

interface FileMetadata {
  name: string;
  sizeFormatted: string;
  extension: string;
  mimeType: string;
}

export default function PublicarPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("cat_vegetales");
  const [unit, setUnit] = useState("CAJA");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("Constanza, La Vega");
  const [variety, setVariety] = useState("");
  const [description, setDescription] = useState("");

  // Estados de Imagen y Archivo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Envío y Feedback
  const [submitting, setSubmitting] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Obtener usuario demo activo
  const [activeUserId, setActiveUserId] = useState("usr_vend_01");

  useEffect(() => {
    const savedId = localStorage.getItem("tc_active_demo_user_id");
    if (savedId) {
      setActiveUserId(savedId);
    }

    const handleUserChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id) {
        setActiveUserId(customEvent.detail.id);
      }
    };

    window.addEventListener("tc-demo-user-changed", handleUserChanged);
    return () => {
      window.removeEventListener("tc-demo-user-changed", handleUserChanged);
    };
  }, []);

  const validateAndProcessFile = (file: File) => {
    setFileError(null);

    const parts = file.name.split(".");
    const extension = parts.length > 1 ? ("." + parts.pop()?.toLowerCase()) : "";
    const isExtensionValid = SUPPORTED_EXTENSIONS.includes(extension);
    const isMimeValid = SUPPORTED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      setFileError(
        `Formato no compatible ("${extension || file.type}"). Solo se aceptan los 5 formatos estándar: JPEG/JPG (.jpg, .jpeg), PNG (.png), GIF (.gif), SVG (.svg) o WebP (.webp).`
      );
      return false;
    }

    // Tamaño máximo recomendado: 8 MB
    if (file.size > 8 * 1024 * 1024) {
      setFileError("El archivo supera el límite de 8 MB. Por favor elige una imagen más ligera.");
      return false;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    setFileMeta({
      name: file.name,
      sizeFormatted,
      extension: extension.replace(".", "").toUpperCase() || "IMG",
      mimeType: file.type || "image/*",
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFileMeta(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const [mun, prov] = location.includes(",")
        ? location.split(",").map((s) => s.trim())
        : [location, "La Vega"];

      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category_id: category,
          unit,
          quantity: parseFloat(quantity),
          price_per_unit: parseFloat(price),
          province: prov || "La Vega",
          municipality: mun || "Constanza",
          variety: variety || undefined,
          description: description || undefined,
          image_url: previewUrl || undefined,
          user_id: activeUserId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "No se pudo registrar la publicación");
      }

      setPublishedPostId(data.post.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el servidor";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setQuantity("");
    setPrice("");
    setVariety("");
    setDescription("");
    handleRemoveImage();
    setPublishedPostId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-texto)", margin: "0 0 6px 0" }}>
          📝 Publicar Cosecha
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "0.95rem" }}>
          Formulario para que los productores registren lotes de siembra y cosecha con soporte fotográfico.
        </p>
      </header>

      {/* Tarjeta de Publicación Exitosa */}
      {publishedPostId ? (
        <Card title="🌱 ¡Cosecha Publicada Exitosamente!" subtitle="Tu lote ya está disponible en el Catálogo">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "10px 0" }}>
            {previewUrl && (
              <div
                style={{
                  width: "160px",
                  height: "140px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "2px solid #86EFAC",
                  backgroundColor: "#FAF9F5",
                }}
              >
                <img
                  src={previewUrl}
                  alt={title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "#166534", margin: "0 0 6px 0" }}>
                {title}
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: 0 }}>
                {quantity} {unit} a RD$ {parseFloat(price).toFixed(2)} por {unit} · {location}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/catalogo" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="large">
                  📦 Ver en el Catálogo
                </Button>
              </Link>
              <Button variant="outline" size="large" onClick={resetForm}>
                ➕ Publicar Otro Lote
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Datos de la Cosecha" subtitle="Todos los campos marcados con (*) son obligatorios">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1. TÍTULO DEL PRODUCTO */}
            <FormField
              id="producto-titulo"
              label="Nombre del Producto"
              placeholder="Ejemplo: Plátano Macho Criollo o Tomate Barceló"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Indica el nombre comercial o común del producto cosechado."
            />

            {/* 2. CATEGORÍA Y UNIDAD */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="categoria-select" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                  Categoría <span style={{ color: "var(--color-terracota)" }}>*</span>
                </label>
                <select
                  id="categoria-select"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  <option value="cat_tuberculos">🥔 Tubérculos y Raíces</option>
                  <option value="cat_vegetales">🍅 Hortalizas y Vegetales</option>
                  <option value="cat_frutas">🥑 Frutas Tropicales</option>
                  <option value="cat_granos">🫘 Granos y Legumbres</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="unidad-select" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                  Unidad de Medida <span style={{ color: "var(--color-terracota)" }}>*</span>
                </label>
                <select
                  id="unidad-select"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
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
                  <option value="CAJA">Caja / Huacal</option>
                  <option value="SACO">Saco</option>
                  <option value="QQ">Quintal (QQ = 100 lb)</option>
                  <option value="CIEN">Cien (100 unidades)</option>
                  <option value="LB">Libra (lb)</option>
                  <option value="KG">Kilogramo (kg)</option>
                </select>
              </div>
            </div>

            {/* 3. CANTIDAD Y PRECIO */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <FormField
                id="cantidad-stock"
                type="number"
                label="Cantidad Disponible (Stock)"
                placeholder="Ej: 150"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                helperText="Volumen total que tienes disponible para entregar."
              />
              <FormField
                id="precio-unitario"
                type="number"
                label="Precio por Unidad (RD$)"
                placeholder="Ej: 650.00"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                helperText="Precio en pesos dominicanos acordado por unidad."
              />
            </div>

            {/* 4. VARIEDAD Y UBICACIÓN */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <FormField
                id="variedad-cultivo"
                label="Variedad (Opcional)"
                placeholder="Ej: Barceló Selección, Macho Fino, Semil-34"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                helperText="Especificación botánica o comercial del cultivo."
              />
              <FormField
                id="ubicacion-finca"
                label="Ubicación de la Cosecha"
                placeholder="Ejemplo: Constanza, La Vega"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                helperText="Municipio y provincia para coordinar el retiro."
              />
            </div>

            {/* 5. DESCRIPCIÓN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="descripcion-cultivo" style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                Descripción o Condiciones del Lote
              </label>
              <textarea
                id="descripcion-cultivo"
                rows={3}
                placeholder="Detalla frescura, empaque, condiciones de maduración o disponibilidad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  padding: "10px 14px",
                  fontSize: "1rem",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  resize: "vertical",
                }}
              />
            </div>

            {/* 6. MÓDULO INTERACTIVO DE CARGA DE IMÁGENES (5 FORMATOS) */}
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                <label style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-texto)" }}>
                  Fotografía del Cultivo
                </label>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  5 Formatos soportados: JPG, PNG, GIF, SVG, WebP
                </span>
              </div>

              {/* Input de archivo real oculto */}
              <input
                ref={fileInputRef}
                type="file"
                id="foto-cultivo-input"
                accept=".jpg,.jpeg,.png,.gif,.svg,.webp,image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {/* Si NO hay imagen seleccionada: Dropzone */}
              {!previewUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? "var(--color-verde-bosque)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isDragging ? "#F2F8F4" : "#FAF9F5",
                    padding: "24px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "6px" }}>📸</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-verde-bosque)", marginBottom: "4px" }}>
                    Haz clic aquí o arrastra la fotografía de tu cosecha
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 10px 0" }}>
                    Archivos de imagen hasta 8 MB
                  </p>

                  {/* Pills de los 5 formatos admitidos */}
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                    {["JPEG / JPG", "PNG", "GIF", "SVG", "WebP"].map((fmt) => (
                      <span
                        key={fmt}
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#EFECE1",
                          color: "var(--color-texto)",
                          border: "1px solid #DCD6C8",
                        }}
                      >
                        ✓ {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* Vista Previa Instantánea del Archivo Seleccionado */
                <div
                  style={{
                    border: "1px solid #86EFAC",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#F2F8F4",
                    padding: "16px",
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "100px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #DCD6C8",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Vista previa del cultivo"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          backgroundColor: "var(--color-verde-bosque)",
                          color: "#FFFFFF",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {fileMeta?.extension}
                      </span>
                      <strong style={{ fontSize: "0.95rem", color: "var(--color-texto)", wordBreak: "break-all" }}>
                        {fileMeta?.name}
                      </strong>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      Tamaño: {fileMeta?.sizeFormatted} · Formato verificado para la web
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: "none",
                          border: "1px solid var(--color-verde-bosque)",
                          color: "var(--color-verde-bosque)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        🔄 Cambiar foto
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          background: "none",
                          border: "1px solid #EF4444",
                          color: "#DC2626",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Eliminar foto
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje de Error en Validación de Archivo */}
              {fileError && (
                <div
                  role="alert"
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "var(--color-error-bg)",
                    border: "1px solid var(--color-error-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-error)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  ⚠️ {fileError}
                </div>
              )}
            </div>

            {/* Error de Envío de Servidor */}
            {submitError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "var(--color-error-bg)",
                  border: "1px solid var(--color-error-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-error)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                ⚠️ {submitError}
              </div>
            )}

            {/* Botón Guardar */}
            <div style={{ marginTop: "12px" }}>
              <Button type="submit" variant="primary" size="large" fullWidth disabled={submitting}>
                {submitting ? "⏳ Guardando lote..." : "🌱 Guardar y Publicar Cosecha"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
