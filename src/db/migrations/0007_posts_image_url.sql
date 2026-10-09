-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0007: SOPORTE DE IMÁGENES EN PUBLICACIONES
-- Añade la columna image_url para almacenar la fotografía o gráfico del producto
-- ==============================================================================

ALTER TABLE marketplace_posts ADD COLUMN image_url TEXT;
