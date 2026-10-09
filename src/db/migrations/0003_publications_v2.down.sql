-- ==============================================================================
-- TECNO COSECHA — REVERSIÓN DE MIGRACIÓN 0003 (DOWN)
-- ==============================================================================

DROP TABLE IF EXISTS marketplace_posts;
DELETE FROM schema_migrations WHERE version = '0003';
