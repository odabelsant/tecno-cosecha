-- ==============================================================================
-- TECNO COSECHA — SEMILLAS INICIALES (SEEDS 0001: CATEGORÍAS AGRÍCOLAS)
-- Justificación: Categorías aprobadas en Fase 02 para el agro dominicano
-- ==============================================================================

INSERT OR IGNORE INTO categories (id, name, slug, description, icon) VALUES
('cat_tuberculos', 'Tubérculos y Raíces', 'tuberculos', 'Plátano verde y maduro, yuca mocana, batata, ñame y yautía', '🥔'),
('cat_vegetales', 'Hortalizas y Vegetales', 'vegetales', 'Tomate barceló y bugalú, cebolla roja y blanca, ají gustoso y morrón', '🍅'),
('cat_frutas', 'Frutas Tropicales', 'frutas', 'Aguacate criollo y semil 34, mango banilejo, limón agrio y piña', '🥑'),
('cat_granos', 'Granos y Legumbres', 'granos', 'Habichuelas rojas y negras, guandules frescos y maíz dulce', '🫘');
