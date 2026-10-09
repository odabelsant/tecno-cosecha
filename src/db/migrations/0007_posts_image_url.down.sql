-- Reversión de migración 0007: eliminar columna image_url
ALTER TABLE marketplace_posts DROP COLUMN image_url;
