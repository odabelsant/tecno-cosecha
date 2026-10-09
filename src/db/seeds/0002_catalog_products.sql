-- ==============================================================================
-- TECNO COSECHA — SEMILLAS DE PRODUCTOS DE CATÁLOGO (SEEDS 0002)
-- Justificación: Productos base del agro dominicano (Frutas, Vegetales y Tubérculos)
-- ==============================================================================

INSERT OR IGNORE INTO catalog_products (id, category_id, name, common_name, variety, default_unit, origin_region, is_regulated, is_active) VALUES
('prod_platano_macho', 'cat_tuberculos', 'Plátano Macho Criollo', 'Plátano verde', 'Macho x hembra', 'CIEN', 'Cibao Central (La Vega, Espaillat)', 0, 1),
('prod_yuca_mocana', 'cat_tuberculos', 'Yuca Mocana', 'Yuca dulce', 'Criolla blanca', 'QQ', 'Espaillat (Moca)', 0, 1),
('prod_batata', 'cat_tuberculos', 'Batata Dominicana', 'Batata morada/blanca', 'Criolla', 'QQ', 'San Juan de la Maguana', 0, 1),
('prod_tomate_barcelo', 'cat_vegetales', 'Tomate Barceló', 'Tomate ensalada', 'Barceló F1', 'CAJA', 'Azua / San José de Ocoa', 0, 1),
('prod_cebolla_roja', 'cat_vegetales', 'Cebolla Roja Criolla', 'Cebolla roja', 'Red Creole', 'QQ', 'Peravia / Vallejuelo', 0, 1),
('prod_aji_gustoso', 'cat_vegetales', 'Ají Gustoso', 'Ajicito criollo', 'Gustoso criollo', 'LB', 'La Vega / Jarabacoa', 0, 1),
('prod_aguacate_semil34', 'cat_frutas', 'Aguacate Semil 34', 'Aguacate de cáscara dura', 'Semil 34', 'CIEN', 'San Cristóbal (Cambita)', 0, 1),
('prod_mango_banilejo', 'cat_frutas', 'Mango Banilejo', 'Mango criollo', 'Banilejo', 'CAJA', 'Peravia (Baní)', 0, 1),
('prod_limon_agrio', 'cat_frutas', 'Limón Agrio Criollo', 'Limón criollo', 'Criollo con semilla', 'CIEN', 'Monte Plata / Hato Mayor', 0, 1),
-- Datos de prueba claramente identificados para testing
('TEST_PROD_SAMPLE', 'cat_tuberculos', '[TEST] Tubérculo de Prueba', 'Muestra controlada', 'Test Variety', 'LB', 'Zona de Pruebas', 0, 1);
