-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0003: PUBLICACIONES DE COMPRA Y VENTA (FASE 08)
-- Justificación: Soporte de ofertas (vender), demandas (comprar), borradores y control de dueño
-- ==============================================================================

CREATE TABLE IF NOT EXISTS marketplace_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK(post_type IN ('OFERTA', 'DEMANDA')), -- OFERTA: Vender, DEMANDA: Comprar
  product_id TEXT REFERENCES catalog_products(id) ON DELETE RESTRICT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  variety TEXT,
  description TEXT,
  unit TEXT NOT NULL CHECK(unit IN ('LB', 'QQ', 'CIEN', 'SACO', 'CAJA', 'KG', 'UNIDAD')),
  quantity REAL NOT NULL CHECK(quantity >= 0),
  price_per_unit REAL NOT NULL CHECK(price_per_unit >= 0),
  target_date TEXT NOT NULL, -- Fecha de cosecha o fecha requerida de entrega
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVA' CHECK(status IN ('BORRADOR', 'ACTIVA', 'CERRADA')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON marketplace_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON marketplace_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_category ON marketplace_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON marketplace_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON marketplace_posts(created_at DESC);
