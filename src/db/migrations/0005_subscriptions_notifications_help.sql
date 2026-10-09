-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0005: PLANES, NOTIFICACIONES Y AYUDA
-- Fases: 13 (Planes y Permisos) y 14 (Notificaciones y Ayuda al Usuario)
-- ==============================================================================

-- 1. Tabla de Planes de Suscripción y Verificación (Fase 13)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'EXPLORA' CHECK(plan_tier IN ('EXPLORA', 'VENDEDOR', 'NEGOCIO')),
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0, 1)),
  verification_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(plan_tier);

-- 2. Tabla de Notificaciones In-App Esenciales (Fase 14)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN ('QUOTE_RECEIVED', 'QUOTE_COUNTERED', 'QUOTE_ACCEPTED', 'ORDER_STATUS_CHANGED', 'INCIDENT_OPENED', 'INCIDENT_RESOLVED')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT CHECK(reference_type IN ('QUOTE', 'ORDER', 'INCIDENT', 'SYSTEM')),
  is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_dedup ON notifications(user_id, event_type, reference_id);

-- 3. Tabla de Tutoriales y Ayuda Contextual Configurable (Fase 14)
CREATE TABLE IF NOT EXISTS help_tutorials (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('COTIZACIONES', 'PEDIDOS', 'PUBLICACIONES', 'PAGOS', 'GENERAL')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  steps_json TEXT NOT NULL,
  external_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_help_tutorials_category ON help_tutorials(category);
