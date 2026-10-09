-- Reversión de Migración 0006
DROP INDEX IF EXISTS idx_admin_audit_logs_target;
DROP INDEX IF EXISTS idx_admin_audit_logs_action;
DROP INDEX IF EXISTS idx_admin_audit_logs_actor;
DROP TABLE IF EXISTS admin_audit_logs;
