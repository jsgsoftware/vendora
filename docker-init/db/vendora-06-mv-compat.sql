DROP VIEW IF EXISTS mv_categories;
CREATE VIEW mv_categories AS
SELECT
  c.id AS id,
  c.data->>'name' AS name,
  COALESCE(c.data->>'slug', c.id) AS slug,
  NULL::text AS parent_id,
  'active'::text AS status,
  jsonb_build_object('showInStore', true, 'sortOrder', 0) AS metadata
FROM vendora_categories c
UNION ALL
SELECT
  s.id AS id,
  s.data->>'name' AS name,
  COALESCE(s.data->>'slug', s.id) AS slug,
  s.data->>'parent' AS parent_id,
  'active'::text AS status,
  jsonb_build_object('showInStore', true, 'sortOrder', 0) AS metadata
FROM vendora_sub_categories s;

DROP VIEW IF EXISTS mv_products;
CREATE VIEW mv_products AS
SELECT
  p.id AS id,
  p.data->>'name' AS name,
  p.data->>'description' AS description,
  p.data->>'brand' AS brand,
  p.data->>'slug' AS slug,
  p.data->>'category' AS category_id,
  COALESCE((p.data->'subProducts'->0->>'sku'), p.id) AS sku,
  p.data AS additional,
  p.created_at AS created_at,
  COALESCE((p.data->>'updatedAt')::timestamptz, p.created_at) AS updated_at
FROM vendora_products p;

DROP VIEW IF EXISTS mv_product_media;
CREATE VIEW mv_product_media AS
SELECT
  p.id AS id,
  p.id AS product_id,
  img.value->>'url' AS url,
  img.ordinality - 1 AS sort_order
FROM vendora_products p
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.data->'subProducts'->0->'images', '[]'::jsonb)) WITH ORDINALITY AS img(value, ordinality);

DROP VIEW IF EXISTS mv_vendor_product_offers;
CREATE VIEW mv_vendor_product_offers AS
SELECT
  COALESCE(v.id, 'vendor_default') AS vendor_id,
  p.id AS product_id,
  COALESCE(sp->>'sku', p.id) AS seller_sku,
  COALESCE((sz->>'qty')::int, 0) AS quantity,
  COALESCE((sz->>'price')::numeric, 0) AS price
FROM vendora_products p
LEFT JOIN LATERAL jsonb_array_elements(COALESCE(p.data->'subProducts', '[]'::jsonb)) sp ON true
LEFT JOIN LATERAL jsonb_array_elements(COALESCE(sp->'sizes', '[]'::jsonb)) sz ON true
LEFT JOIN mv_vendors v ON true;
