-- ==============================================================================
-- TECNO COSECHA — REVERSIÓN DE MIGRACIÓN 0002 (DOWN)
-- ==============================================================================

DROP TABLE IF EXISTS catalog_products;
DELETE FROM schema_migrations WHERE version = '0002';
