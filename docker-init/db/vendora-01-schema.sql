-- =============================================================================
-- VENDORA SCHEMA (vendora_ prefix)
-- Aisladas de tablas InsForge (bigserial id). Todas usan id TEXT PK.
-- ============================================================================

-- Users
CREATE TABLE IF NOT EXISTS vendora_users (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Categories
CREATE TABLE IF NOT EXISTS vendora_categories (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Sub-categories
CREATE TABLE IF NOT EXISTS vendora_sub_categories (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Products
CREATE TABLE IF NOT EXISTS vendora_products (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Carts
CREATE TABLE IF NOT EXISTS vendora_carts (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Coupons
CREATE TABLE IF NOT EXISTS vendora_coupons (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Orders
CREATE TABLE IF NOT EXISTS vendora_orders (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Home Sections
CREATE TABLE IF NOT EXISTS vendora_home_sections (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- Multi-vendor tables
-- ============================================================

CREATE TABLE IF NOT EXISTS mv_vendors (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  status        TEXT DEFAULT 'pending',
  verification  JSONB DEFAULT '{}',
  settings      JSONB DEFAULT '{}',
  analytics     JSONB DEFAULT '{}',
  legal         JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mv_stores (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  vendor_id     TEXT REFERENCES mv_vendors(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  cover_url     TEXT,
  status        TEXT DEFAULT 'active',
  settings      JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mv_store_products (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  store_id      TEXT REFERENCES mv_stores(id) ON DELETE CASCADE,
  product_id    TEXT REFERENCES vendora_products(id) ON DELETE CASCADE,
  price         NUMERIC(10,2),
  stock         INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'active',
  metadata      JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mv_orders (
  id                TEXT PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  user_id           TEXT REFERENCES vendora_users(id) ON DELETE SET NULL,
  store_id          TEXT REFERENCES mv_stores(id) ON DELETE SET NULL,
  total             NUMERIC(12,2),
  status            TEXT DEFAULT 'pending',
  payment_status    TEXT DEFAULT 'pending',
  shipping_address  JSONB DEFAULT '{}',
  items             JSONB DEFAULT '[]',
  metadata          JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mv_order_items (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  order_id      TEXT REFERENCES mv_orders(id) ON DELETE CASCADE,
  product_id    TEXT REFERENCES vendora_products(id) ON DELETE SET NULL,
  store_id      TEXT REFERENCES mv_stores(id) ON DELETE SET NULL,
  quantity      INTEGER NOT NULL,
  unit_price    NUMERIC(10,2),
  total_price   NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS mv_payments (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  order_id      TEXT REFERENCES mv_orders(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2),
  method        TEXT,
  status        TEXT DEFAULT 'pending',
  provider_data JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS mv_vendor_users (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  vendor_id   TEXT REFERENCES mv_vendors(id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES vendora_users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT DEFAULT 'owner',
  status      TEXT DEFAULT 'active',
  UNIQUE (vendor_id, email)
);

CREATE TABLE IF NOT EXISTS mv_reviews (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  store_id    TEXT REFERENCES mv_stores(id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES vendora_users(id) ON DELETE SET NULL,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  content     TEXT,
  status      TEXT DEFAULT 'pending'
);
