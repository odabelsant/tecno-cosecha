-- ==============================================================================
-- TECNO COSECHA — SEMILLAS DE PRUEBA: 10 VENDEDORES, 10 COMPRADORES Y PUBLICACIONES
-- Contexto agrícola dominicano (Cibao, Sur y Línea Noroeste)
-- ==============================================================================

-- 1. ADMINISTRADOR CENTRAL DE PRUEBA
INSERT OR REPLACE INTO users (id, email, phone, password_hash, role, status)
VALUES ('usr_admin_01', 'admin@tecnocosecha.test', '8095550000', 'hash_demo_123', 'ADMIN', 'ACTIVE');

-- 2. DIEZ VENDEDORES (PRODUCTORES Y AGROEMPRESAS DOMINICANAS)
INSERT OR REPLACE INTO users (id, email, phone, password_hash, role, status) VALUES
('usr_vend_01', 'vendedor1@tecnocosecha.test', '8095550101', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_02', 'vendedor2@tecnocosecha.test', '8095550102', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_03', 'vendedor3@tecnocosecha.test', '8095550103', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_04', 'vendedor4@tecnocosecha.test', '8095550104', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_05', 'vendedor5@tecnocosecha.test', '8095550105', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_06', 'vendedor6@tecnocosecha.test', '8095550106', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_07', 'vendedor7@tecnocosecha.test', '8095550107', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_08', 'vendedor8@tecnocosecha.test', '8095550108', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_09', 'vendedor9@tecnocosecha.test', '8095550109', 'hash_demo_123', 'FARMER', 'ACTIVE'),
('usr_vend_10', 'vendedor10@tecnocosecha.test', '8095550110', 'hash_demo_123', 'FARMER', 'ACTIVE');

-- Perfiles de Productores
INSERT OR REPLACE INTO farmer_profiles (id, user_id, farm_name, province, municipality, sector, contact_phone, bio) VALUES
('fp_01', 'usr_vend_01', 'Finca El Pinar Constanza', 'La Vega', 'Constanza', 'El Valle', '8095550101', 'Cultivo intensivo de papa, zanahoria y hortalizas de clima templado con riego por goteo.'),
('fp_02', 'usr_vend_02', 'Agropecuaria Las Neblinas', 'La Vega', 'Jarabacoa', 'Paso Bajito', '8095550102', 'Productores de habichuelas rojas de montaña y plátano criollo de ladera.'),
('fp_03', 'usr_vend_03', 'Platanera El Valle del Yaque', 'Valverde', 'Mao', 'Ámina', '8095550103', 'Finca platanera y bananera con certificación de calidad para mercado nacional.'),
('fp_04', 'usr_vend_04', 'Frutales Los Mangos Banilejos', 'Peravia', 'Baní', 'Sombrero', '8095550104', 'Productores tradicionales de mangos de exportación y cebolla roja criolla.'),
('fp_05', 'usr_vend_05', 'Finca Hatico del Yaque del Sur', 'Azua', 'Azua de Compostela', 'Estebanía', '8095550105', 'Especialistas en tomate de mesa tipo Barceló y ajíes gustosos de alta rotación.'),
('fp_06', 'usr_vend_06', 'Parcela Granos San Juan', 'San Juan', 'San Juan de la Maguana', 'Las Matas de Farfán', '8095550106', 'Cultivo cooperativo de habichuelas negras, guandules verdes y maíz dulce.'),
('fp_07', 'usr_vend_07', 'Finca Los Mocanos Criollos', 'Espaillat', 'Moca', 'Juan López', '8095550107', 'Tierra fértil productora de la auténtica Yuca Mocana y tubérculos tradicionales.'),
('fp_08', 'usr_vend_08', 'Rancho Ocoa Verde', 'San José de Ocoa', 'Rancho Arriba', 'Nizao', '8095550108', 'Invernaderos y plantaciones de aguacate Semil-34 y ají morrón holandés.'),
('fp_09', 'usr_vend_09', 'Platanera Costa Enriquillo', 'Barahona', 'Santa Cruz de Barahona', 'Vicente Noble', '8095550109', 'Finca de plátano barahonero gigante reconocido por su gran calibre y rendimiento.'),
('fp_10', 'usr_vend_10', 'Frutales La Esmeralda', 'Monte Plata', 'Bayaguana', 'Comatillo', '8095550110', 'Cítricos, chinola criolla de mata y piña cabezona de alta dulzura.');

-- Suscripciones y Verificaciones de Vendedores (VENDEDOR, Verificados)
INSERT OR REPLACE INTO user_subscriptions (id, user_id, plan_tier, is_verified, verification_notes) VALUES
('sub_v01', 'usr_vend_01', 'VENDEDOR', 1, 'Inspección de finca y análisis de suelos completado.'),
('sub_v02', 'usr_vend_02', 'VENDEDOR', 1, 'Asociación de agricultores de Jarabacoa avalada.'),
('sub_v03', 'usr_vend_03', 'VENDEDOR', 1, 'Inspección de canal de riego y cédula validada.'),
('sub_v04', 'usr_vend_04', 'VENDEDOR', 1, 'Certificación de origen Baní aprobada.'),
('sub_v05', 'usr_vend_05', 'VENDEDOR', 1, 'Verificación fotográfica de parcelas en producción.'),
('sub_v06', 'usr_vend_06', 'VENDEDOR', 1, 'Cooperativa granera de San Juan acreditada.'),
('sub_v07', 'usr_vend_07', 'VENDEDOR', 1, 'Inspección técnica de Moca y títulos verificados.'),
('sub_v08', 'usr_vend_08', 'VENDEDOR', 1, 'Invernaderos Ocoa inspeccionados por técnico agrónomo.'),
('sub_v09', 'usr_vend_09', 'VENDEDOR', 1, 'Registro de productor del Suroeste confirmado.'),
('sub_v10', 'usr_vend_10', 'VENDEDOR', 1, 'Finca de Bayaguana validada presencialmente.');

-- 3. DIEZ COMPRADORES (SUPERMERCADOS, MAYORISTAS Y COLMADOS)
INSERT OR REPLACE INTO users (id, email, phone, password_hash, role, status) VALUES
('usr_comp_01', 'comprador1@tecnocosecha.test', '8095550201', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_02', 'comprador2@tecnocosecha.test', '8095550202', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_03', 'comprador3@tecnocosecha.test', '8095550203', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_04', 'comprador4@tecnocosecha.test', '8095550204', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_05', 'comprador5@tecnocosecha.test', '8095550205', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_06', 'comprador6@tecnocosecha.test', '8095550206', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_07', 'comprador7@tecnocosecha.test', '8095550207', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_08', 'comprador8@tecnocosecha.test', '8095550208', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_09', 'comprador9@tecnocosecha.test', '8095550209', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE'),
('usr_comp_10', 'comprador10@tecnocosecha.test', '8095550210', 'hash_demo_123', 'BUYER_BUSINESS', 'ACTIVE');

-- Perfiles de Compradores
INSERT OR REPLACE INTO buyer_profiles (id, user_id, buyer_type, business_name, rnc, delivery_address, contact_phone) VALUES
('bp_01', 'usr_comp_01', 'BUSINESS', 'Supermercado El Grano de Oro', '101889922', 'Av. Juan Pablo Duarte 102, Santiago', '8095550201'),
('bp_02', 'usr_comp_02', 'BUSINESS', 'Distribuidora Agrícola Mercado Duarte', '130445588', 'Nave 14, Mercado Nuevo de la Duarte, Santo Domingo', '8095550202'),
('bp_03', 'usr_comp_03', 'BUSINESS', 'Colmado Don Chepe y Familia', NULL, 'Calle Rómulo Betancourt 412, Bella Vista, Distrito Nacional', '8095550203'),
('bp_04', 'usr_comp_04', 'BUSINESS', 'Restaurante El Fogón Dominicano', '131998844', 'Av. Winston Churchill 88, Piantini, Distrito Nacional', '8095550204'),
('bp_05', 'usr_comp_05', 'BUSINESS', 'Colmado La Fe de Los Mina', NULL, 'Calle San Vicente de Paúl 55, Santo Domingo Este', '8095550205'),
('bp_06', 'usr_comp_06', 'BUSINESS', 'Supermercado Central de La Vega', '104771133', 'Av. Pedro A. Rivera 200, La Vega', '8095550206'),
('bp_07', 'usr_comp_07', 'BUSINESS', 'Agromercado Hospedaje Yaque', '132665511', 'Calle Capotillo 30, Hospedaje Yaque, Santiago', '8095550207'),
('bp_08', 'usr_comp_08', 'BUSINESS', 'Distribuidora San Cristóbal Agro', '108223344', 'Carretera Sánchez Km 3, San Cristóbal', '8095550208'),
('bp_09', 'usr_comp_09', 'BUSINESS', 'Colmado El Campesino de Villa Mella', NULL, 'Av. Hermanas Mirabal 140, Santo Domingo Norte', '8095550209'),
('bp_10', 'usr_comp_10', 'BUSINESS', 'Hotel & Mesón Campestre Las Praderas', '130889900', 'Carretera Jarabacoa-Manabao Km 4, Jarabacoa', '8095550210');

-- Suscripciones de Compradores (NEGOCIO y EXPLORA)
INSERT OR REPLACE INTO user_subscriptions (id, user_id, plan_tier, is_verified, verification_notes) VALUES
('sub_c01', 'usr_comp_01', 'NEGOCIO', 1, 'RNC comercial activo validado con DGII.'),
('sub_c02', 'usr_comp_02', 'NEGOCIO', 1, 'Distribuidor mayorista registrado en la Duarte.'),
('sub_c03', 'usr_comp_03', 'EXPLORA', 1, 'Comercio local verificado con cédula.'),
('sub_c04', 'usr_comp_04', 'NEGOCIO', 1, 'Razón social gastronómica verificada.'),
('sub_c05', 'usr_comp_05', 'EXPLORA', 1, 'Colmado minorista verificado.'),
('sub_c06', 'usr_comp_06', 'NEGOCIO', 1, 'Cadena regional de supermercados verificada.'),
('sub_c07', 'usr_comp_07', 'NEGOCIO', 1, 'Puesto mayorista en Hospedaje Yaque verificado.'),
('sub_c08', 'usr_comp_08', 'NEGOCIO', 1, 'RNC comercial verificado en San Cristóbal.'),
('sub_c09', 'usr_comp_09', 'EXPLORA', 1, 'Negocio familiar minorista verificado.'),
('sub_c10', 'usr_comp_10', 'NEGOCIO', 1, 'Empresa hotelera y restaurante verificada.');

-- 4. PUBLICACIONES ACTIVAS ASOCIADAS A LOS VENDEDORES (1 a 3 lotes por productor)
INSERT OR REPLACE INTO marketplace_posts (
  id, user_id, post_type, product_id, category_id, title, variety, description,
  unit, quantity, price_per_unit, target_date, province, municipality, image_url, status
) VALUES
-- Vendedor 1: Constanza
('post_demo_01', 'usr_vend_01', 'OFERTA', 'prod_tomate_barcelo', 'cat_vegetales', 'Tomate Barceló de Altura', 'Barceló Selección', 'Tomate de ensalada firme cosechado en clima frío, empacado en cajas plásticas limpias.', 'CAJA', 250, 650.00, '2026-10-25', 'La Vega', 'Constanza', '/images/crops/tomate.svg', 'ACTIVA'),
('post_demo_02', 'usr_vend_01', 'OFERTA', NULL, 'cat_tuberculos', 'Zanahoria Dulce Criolla', 'Chantenay', 'Zanahoria fresca lavada de primera calidad, lista para supermercado o colmado.', 'SACO', 180, 1200.00, '2026-10-28', 'La Vega', 'Constanza', '/images/crops/zanahoria.svg', 'ACTIVA'),

-- Vendedor 2: Jarabacoa
('post_demo_03', 'usr_vend_02', 'OFERTA', NULL, 'cat_granos', 'Habichuela Roja de Jarabacoa', 'Goya Roja', 'Grano seco seleccionado, sin piedras ni impurezas, secado natural al sol.', 'QQ', 80, 4800.00, '2026-11-05', 'La Vega', 'Jarabacoa', '/images/crops/habichuela.svg', 'ACTIVA'),
('post_demo_04', 'usr_vend_02', 'OFERTA', 'prod_platano_macho', 'cat_tuberculos', 'Plátano Criollo de Ladera', 'Macho Fino', 'Plátano verde de montaña, pulpa compacta y excelente sabor para frituras y puré.', 'CIEN', 120, 1600.00, '2026-10-30', 'La Vega', 'Jarabacoa', '/images/crops/platano.svg', 'ACTIVA'),

-- Vendedor 3: Mao
('post_demo_05', 'usr_vend_03', 'OFERTA', 'prod_platano_macho', 'cat_tuberculos', 'Plátano Macho Maeño Mayorista', 'Macho Gigante', 'Corte directo de mata. Excelente tamaño y peso, despachos en camión completo.', 'QQ', 500, 1350.00, '2026-10-22', 'Valverde', 'Mao', '/images/crops/platano.svg', 'ACTIVA'),

-- Vendedor 4: Baní
('post_demo_06', 'usr_vend_04', 'OFERTA', 'prod_mango_banilejo', 'cat_frutas', 'Mango Banilejo Dulce', 'Gota de Oro / Banilejo', 'Mango aromático madurado al sol, cosecha de temporada para fruterías y repostería.', 'CAJA', 300, 550.00, '2026-10-24', 'Peravia', 'Baní', '/images/crops/mango.svg', 'ACTIVA'),
('post_demo_07', 'usr_vend_04', 'OFERTA', 'prod_cebolla_roja', 'cat_vegetales', 'Cebolla Roja Criolla Seca', 'Roja Dominicana', 'Cebolla bien curada en trenzas y mallas, cáscara brillante y pungencia ideal.', 'QQ', 150, 3100.00, '2026-11-02', 'Peravia', 'Baní', '/images/crops/cebolla.svg', 'ACTIVA'),

-- Vendedor 5: Azua
('post_demo_08', 'usr_vend_05', 'OFERTA', 'prod_tomate_barcelo', 'cat_vegetales', 'Tomate Barceló de Azua', 'Barceló Pintón', 'Tomate pintón de alto rendimiento, ideal para transporte de larga distancia sin magulladuras.', 'CAJA', 400, 580.00, '2026-10-26', 'Azua', 'Azua de Compostela', '/images/crops/tomate.svg', 'ACTIVA'),
('post_demo_09', 'usr_vend_05', 'OFERTA', 'prod_aji_gustoso', 'cat_vegetales', 'Ají Gustoso Típico', 'Criollo del Sur', 'Ají aromático tradicional para sazones y sofritos dominicanos, recién recolectado.', 'SACO', 90, 1450.00, '2026-10-27', 'Azua', 'Azua de Compostela', '/images/crops/aji.svg', 'ACTIVA'),

-- Vendedor 6: San Juan
('post_demo_10', 'usr_vend_06', 'OFERTA', NULL, 'cat_granos', 'Habichuela Negra Sanjuanera', 'Negra Criolla', 'Grano negro uniforme, cosecha nueva, rápida cocción y caldo espeso.', 'QQ', 200, 3900.00, '2026-11-10', 'San Juan', 'San Juan de la Maguana', '/images/crops/habichuela.svg', 'ACTIVA'),
('post_demo_11', 'usr_vend_06', 'OFERTA', NULL, 'cat_granos', 'Guandul Verde en Vaina', 'Verde San Juan', 'Vainas frescas llenas para desgranar, directo del campo a mercados urbanos.', 'SACO', 110, 2200.00, '2026-10-29', 'San Juan', 'San Juan de la Maguana', '/images/crops/habichuela.svg', 'ACTIVA'),

-- Vendedor 7: Moca
('post_demo_12', 'usr_vend_07', 'OFERTA', 'prod_yuca_mocana', 'cat_tuberculos', 'Yuca Mocana Blandita', 'Pata de Paloma', 'Yuca blanca con garantía de cocción suave en 15 minutos, corte del día.', 'QQ', 350, 1500.00, '2026-10-23', 'Espaillat', 'Moca', '/images/crops/yuca.svg', 'ACTIVA'),
('post_demo_13', 'usr_vend_07', 'OFERTA', 'prod_batata', 'cat_tuberculos', 'Batata Morada Dominicana', 'Morada Dulce', 'Batata de piel rojiza y masa dulce, perfecta para asar o hervir.', 'QQ', 160, 1100.00, '2026-11-01', 'Espaillat', 'Moca', '/images/crops/batata.svg', 'ACTIVA'),

-- Vendedor 8: San José de Ocoa
('post_demo_14', 'usr_vend_08', 'OFERTA', 'prod_aguacate_semil34', 'cat_frutas', 'Aguacate Semil-34 de Exportación', 'Semil-34', 'Aguacate verde mantequilla, masa cremosa y larga vida de anaquel para distribución.', 'CAJA', 280, 850.00, '2026-10-31', 'San José de Ocoa', 'Rancho Arriba', '/images/crops/aguacate.svg', 'ACTIVA'),

-- Vendedor 9: Barahona
('post_demo_15', 'usr_vend_09', 'OFERTA', 'prod_platano_macho', 'cat_tuberculos', 'Plátano Barahonero Extra Grande', 'Macho Barahonero', 'El plátano más cotizado del mercado por su longitud y grosor. Para fritos premium.', 'CIEN', 220, 2100.00, '2026-10-24', 'Barahona', 'Santa Cruz de Barahona', '/images/crops/platano.svg', 'ACTIVA'),

-- Vendedor 10: Monte Plata
('post_demo_16', 'usr_vend_10', 'OFERTA', NULL, 'cat_frutas', 'Chinola Criolla Ácida', 'Amarilla Dominicana', 'Fruta pesada y llena de pulpa jugosa para jugos naturales y agroindustria.', 'CIEN', 170, 750.00, '2026-10-27', 'Monte Plata', 'Bayaguana', '/images/crops/chinola.svg', 'ACTIVA'),

-- 5. PUBLICACIONES DE TIPO DEMANDA ASOCIADAS A LOS COMPRADORES (VISTA "VENDER")
-- Comprador 1: Supermercado El Grano de Oro (Santiago)
('post_dem_01', 'usr_comp_01', 'DEMANDA', 'prod_platano_macho', 'cat_tuberculos', 'Requerimiento Semanal de Plátano Macho Maeño', 'Macho de Primera', 'Supermercado en Santiago requiere suministro continuo de plátano verde calibre grande. Pago contra entrega e inspección en andén.', 'QQ', 300, 1300.00, '2026-10-26', 'Santiago', 'Santiago de los Caballeros', '/images/crops/platano.svg', 'ACTIVA'),
('post_dem_02', 'usr_comp_01', 'DEMANDA', 'prod_yuca_mocana', 'cat_tuberculos', 'Compra Mayorista de Yuca Mocana Blanca', 'Pata de Paloma Blandita', 'Buscamos productores directos de Moca o La Vega con yuca fresca del día. Despacho en sacos limpios.', 'QQ', 200, 1450.00, '2026-10-28', 'Santiago', 'Santiago de los Caballeros', '/images/crops/yuca.svg', 'ACTIVA'),

-- Comprador 2: Distribuidora Agrícola Mercado Duarte (Santo Domingo)
('post_dem_03', 'usr_comp_02', 'DEMANDA', 'prod_tomate_barcelo', 'cat_vegetales', 'Demanda de Tomate Barceló Pintón para Nave Mayorista', 'Barceló Firme', 'Recepción en Mercado Nuevo de la Duarte. Requerimos tomate con buena firmeza para distribución a colmados del Gran Santo Domingo.', 'CAJA', 500, 600.00, '2026-10-27', 'Distrito Nacional', 'Santo Domingo', '/images/crops/tomate.svg', 'ACTIVA'),
('post_dem_04', 'usr_comp_02', 'DEMANDA', 'prod_cebolla_roja', 'cat_vegetales', 'Suministro de Cebolla Roja Seca de Baní', 'Roja Criolla Curada', 'Compra por camión completo de cebolla bien curada en mallas o trenzas. Verificación en báscula.', 'QQ', 250, 2950.00, '2026-11-02', 'Distrito Nacional', 'Santo Domingo', '/images/crops/cebolla.svg', 'ACTIVA'),

-- Comprador 3: Colmado Don Chepe y Familia (Bella Vista, DN)
('post_dem_05', 'usr_comp_03', 'DEMANDA', 'prod_aguacate_semil34', 'cat_frutas', 'Lote de Aguacate Semil-34 y Criollo para Colmado', 'Semil-34 Mantequilla', 'Abastecimiento quincenal para clientela residencial de Bella Vista. Buscamos calibre mediano a grande.', 'CAJA', 80, 800.00, '2026-10-29', 'Distrito Nacional', 'Santo Domingo', '/images/crops/aguacate.svg', 'ACTIVA'),

-- Comprador 4: Restaurante El Fogón Dominicano (Piantini, DN)
('post_dem_06', 'usr_comp_04', 'DEMANDA', 'prod_aji_gustoso', 'cat_vegetales', 'Ají Gustoso Fresco y Verduras para Cadena Gastronómica', 'Gustoso Típico Aromático', 'Para preparación de sofritos y sazones tradicionales. Requerimos entrega directa en restaurante los martes y viernes.', 'SACO', 40, 1400.00, '2026-10-25', 'Distrito Nacional', 'Santo Domingo', '/images/crops/aji.svg', 'ACTIVA'),

-- Comprador 5: Colmado La Fe de Los Mina (Santo Domingo Este)
('post_dem_07', 'usr_comp_05', 'DEMANDA', 'prod_platano_macho', 'cat_tuberculos', 'Plátano Barahonero Extra para Frituras Urbanas', 'Barahonero Gigante', 'Requerimiento quincenal de plátano verde grande para tostones y mofongo en Santo Domingo Este.', 'CIEN', 100, 2000.00, '2026-10-30', 'Santo Domingo', 'Santo Domingo Este', '/images/crops/platano.svg', 'ACTIVA'),

-- Comprador 6: Supermercado Central de La Vega (La Vega)
('post_dem_08', 'usr_comp_06', 'DEMANDA', NULL, 'cat_tuberculos', 'Zanahoria Lavada Dulce de Altura de Constanza', 'Chantenay de Primera', 'Supermercado regional en La Vega busca productor directo de Constanza. Empaque limpio en sacos de 50 lb.', 'SACO', 150, 1150.00, '2026-10-27', 'La Vega', 'La Vega', '/images/crops/zanahoria.svg', 'ACTIVA'),

-- Comprador 7: Agromercado Hospedaje Yaque (Santiago)
('post_dem_09', 'usr_comp_07', 'DEMANDA', NULL, 'cat_granos', 'Habichuela Roja y Negra Sanjuanera Cosecha Nueva', 'Goya Roja Criolla', 'Puesto mayorista en Hospedaje Yaque compra lote de granos limpios al sol, sin gorgojos ni impurezas.', 'QQ', 120, 4600.00, '2026-11-05', 'Santiago', 'Santiago de los Caballeros', '/images/crops/habichuela.svg', 'ACTIVA'),

-- Comprador 8: Distribuidora San Cristóbal Agro (San Cristóbal)
('post_dem_10', 'usr_comp_08', 'DEMANDA', 'prod_mango_banilejo', 'cat_frutas', 'Mango Banilejo y Frutas de Temporada para Procesamiento', 'Gota de Oro Banilejo', 'Agroempresa agroindustrial requiere mangos dulces de temporada para pulpa y néctares naturales.', 'CAJA', 350, 500.00, '2026-10-28', 'San Cristóbal', 'San Cristóbal', '/images/crops/mango.svg', 'ACTIVA'),

-- Comprador 9: Colmado Campesino Villa Mella (Santo Domingo Norte)
('post_dem_11', 'usr_comp_09', 'DEMANDA', 'prod_batata', 'cat_tuberculos', 'Batata Morada Dulce Seleccionada', 'Morada Dominicana', 'Compra semanal para colmado popular en Villa Mella. Tubérculos medianos sin picaduras.', 'QQ', 60, 1050.00, '2026-10-29', 'Santo Domingo', 'Santo Domingo Norte', '/images/crops/batata.svg', 'ACTIVA'),

-- Comprador 10: Hotel & Mesón Las Praderas (Jarabacoa)
('post_dem_12', 'usr_comp_10', 'DEMANDA', NULL, 'cat_frutas', 'Chinola Fresca Criolla de Montaña para Desayunos', 'Amarilla Pesada con Buena Pulpa', 'Complejo hotelero de montaña requiere entrega quincenal de chinola recién cosechada para buffet de desayunos.', 'CIEN', 90, 720.00, '2026-10-31', 'La Vega', 'Jarabacoa', '/images/crops/chinola.svg', 'ACTIVA');
