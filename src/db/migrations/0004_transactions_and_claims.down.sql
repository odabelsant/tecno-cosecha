-- ==============================================================================
-- TECNO COSECHA — REVERSIÓN DE MIGRACIÓN 0004 (DOWN)
-- ==============================================================================

DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_timeline;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS quotes;
DELETE FROM schema_migrations WHERE version = '0004';
