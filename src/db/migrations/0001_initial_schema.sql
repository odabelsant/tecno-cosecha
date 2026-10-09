-- ==============================================================================
-- TECNO COSECHA — MIGRACIÓN 0001: ESQUEMA INICIAL RELACIONAL
-- Justificación: Modelo de datos para Usuarios, Perfiles, Categorías y Publicaciones
-- Cumple con: ADR-002 (Modularidad) y ADR-003 (Integridad Relacional ACID)
-- ==============================================================================

-- 1. Tabla de Control de Migraciones
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios y Autenticación
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('FARMER', 'BUYER_INDIVIDUAL', 'BUYER_BUSINESS', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda para autenticación y unicidad
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Perfiles de Productores Agrícolas
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  sector TEXT,
  contact_phone TEXT NOT NULL,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user ON farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_location ON farmer_profiles(province, municipality);

-- 4. Perfiles de Compradores (Consumidores B2C y Comercios B2B)
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  buyer_type TEXT NOT NULL CHECK(buyer_type IN ('CONSUMER', 'BUSINESS')),
  business_name TEXT,
  rnc TEXT,
  delivery_address TEXT,
  contact_phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_type ON buyer_profiles(buyer_type);

-- 5. Categorías Agrícolas Oficiales
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 6. Publicaciones y Lotes de Cosecha
CREATE TABLE IF NOT EXISTS publications (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  variety TEXT,
  description TEXT,
  unit TEXT NOT NULL CHECK(unit IN ('LB', 'QQ', 'CIEN', 'SACO', 'CAJA', 'KG')),
  available_quantity REAL NOT NULL CHECK(available_quantity >= 0),
  min_order_quantity REAL NOT NULL DEFAULT 1 CHECK(min_order_quantity > 0),
  unit_price REAL NOT NULL CHECK(unit_price > 0),
  harvest_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK(status IN ('PREVENTA', 'DISPONIBLE', 'AGOTADO')),
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_publications_farmer ON publications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_publications_category ON publications(category_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_location ON publications(province, municipality);
CREATE INDEX IF NOT EXISTS idx_publications_created ON publications(created_at DESC);
