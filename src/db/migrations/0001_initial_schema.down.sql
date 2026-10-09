-- ==============================================================================
-- TECNO COSECHA — REVERSIÓN DE MIGRACIÓN 0001 (DOWN)
-- ==============================================================================

DROP TABLE IF EXISTS publications;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS buyer_profiles;
DROP TABLE IF EXISTS farmer_profiles;
DROP TABLE IF EXISTS users;
DELETE FROM schema_migrations WHERE version = '0001';
