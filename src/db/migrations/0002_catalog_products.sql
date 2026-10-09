-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0002: CATÁLOGO AGRÍCOLA Y TAXONOMÍA (FASE 07)
-- Justificación: Catálogo de productos agrícolas base con unidades autorizadas
-- ==============================================================================

CREATE TABLE IF NOT EXISTS catalog_products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  common_name TEXT NOT NULL,
  variety TEXT,
  default_unit TEXT NOT NULL CHECK(default_unit IN ('LB', 'QQ', 'CIEN', 'SACO', 'CAJA', 'KG', 'UNIDAD')),
  origin_region TEXT, -- Región agrícola habitual (ej: Cibao Central, Sur, Noroeste)
  is_regulated INTEGER NOT NULL DEFAULT 0 CHECK(is_regulated IN (0, 1)), -- 0: Libre comercio, 1: Regulado
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_name ON catalog_products(name);
CREATE INDEX IF NOT EXISTS idx_catalog_products_active ON catalog_products(is_active);
