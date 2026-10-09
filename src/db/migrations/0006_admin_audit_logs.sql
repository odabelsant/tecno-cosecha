-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0006: AUDITORÍA Y PANEL ADMINISTRATIVO
-- Fase: 15 (Administración y Moderación)
-- ==============================================================================

-- 1. Tabla de Logs de Auditoría para Acciones Sensibles de Administración
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK(action IN ('USER_STATUS_CHANGE', 'USER_PLAN_OVERRIDE', 'POST_MODERATION', 'INCIDENT_RESOLVED', 'INCIDENT_REJECTED', 'TUTORIAL_UPDATED', 'FARM_VERIFIED')),
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  changes_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON admin_audit_logs(target_entity, target_id);
