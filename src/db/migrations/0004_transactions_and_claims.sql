-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0004: COTIZACIONES, PEDIDOS, RESEÑAS E INCIDENCIAS
-- Fases: 10 (Cotizaciones), 11 (Pedidos) y 12 (Confianza/Incidencias)
-- ==============================================================================

-- 1. Tabla de Cotizaciones y Negociación (Fase 10)
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES marketplace_posts(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit TEXT NOT NULL CHECK(unit IN ('LB', 'QQ', 'CIEN', 'SACO', 'CAJA', 'KG', 'UNIDAD')),
  price_per_unit REAL NOT NULL CHECK(price_per_unit > 0),
  quality_spec TEXT,
  delivery_mode TEXT NOT NULL CHECK(delivery_mode IN ('RETIRO_FINCA', 'PUNTO_ACOPIO', 'ENTREGA_VENDEDOR')),
  delivery_location TEXT NOT NULL,
  target_date TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK(status IN ('PENDIENTE', 'CONTRAPROPUESTA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA')),
  version INTEGER NOT NULL DEFAULT 1,
  parent_quote_id TEXT REFERENCES quotes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_buyer ON quotes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller ON quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_post ON quotes(post_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- 2. Tabla de Pedidos Confirmados (Fase 11)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  quote_id TEXT NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE RESTRICT,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  product_title TEXT NOT NULL,
  quality_spec TEXT,
  quantity REAL NOT NULL CHECK(quantity > 0),
  unit TEXT NOT NULL,
  unit_price REAL NOT NULL CHECK(unit_price > 0),
  total_price REAL NOT NULL CHECK(total_price > 0),
  delivery_mode TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  target_delivery_window TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMADO' CHECK(status IN ('CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')),
  received_quantity REAL,
  reception_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 3. Historial de Transiciones de Pedidos (Fase 11)
CREATE TABLE IF NOT EXISTS order_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timeline_order ON order_timeline(order_id);

-- 4. Valoraciones y Reputación (Fase 12)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_id, reviewer_id) -- Regla contra reseñas duplicadas
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);

-- 5. Incidencias y Disputas con Revisión Humana (Fase 12)
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK(reason IN ('CALIDAD_DEFICIENTE', 'DIFERENCIA_PESO_CANTIDAD', 'INCUMPLIMIENTO_FECHA', 'NO_PRESENTACION')),
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'ABIERTA' CHECK(status IN ('ABIERTA', 'EN_MEDIACION', 'RESUELTA', 'RECHAZADA')),
  resolution_notes TEXT,
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_order ON incidents(order_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
