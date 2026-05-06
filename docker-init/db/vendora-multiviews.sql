-- ==========================================================
-- MV_CATEGORIES (denormalized flat view for UI / SSR queries)
-- ==========================================================
CREATE OR REPLACE VIEW mv_categories AS
SELECT
  c.id AS category_id,
  c.id AS slug,
  c.data->>'name' AS name,
  c.data->>'image' AS image,
  COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'name', s.data->>'name',
        'slug', s.data->>'slug',
        'category', c.data->>'name',
        'categoryId', c.id,
        'image', s.data->>'image'
      )
    )
    FROM vendora_sub_categories s
    WHERE s.data->>'parent' = c.id
  ), '[]'::jsonb) AS subCategories
FROM vendora_categories c;

-- ==========================================================
-- MV_VENDOR_PRODUCT_OFFERS (denormalized product listings for vendors)
-- ==========================================================
CREATE OR REPLACE VIEW mv_vendor_product_offers AS
SELECT
  v.id AS vendor_id,
  v.data->>'slug' AS vendor_slug,
  v.data->>'name' AS vendor_name,
  p.id AS product_id,
  p.data->>'name' AS product_name,
  p.data->>'brand' AS brand,
  p.data->>'slug' AS product_slug,
  (p.data->>'shipping')::jsonb AS shipping,
  sp->>'sku' AS sku,
  sp->>'color' AS color,
  COALESCE((sp->'images')->0->>'url', '') AS image,
  (sp->>'discount')::numeric AS discount,
  COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'size', sz->>'size',
        'price', (sz->>'price')::numeric,
        'qty', (sz->>'qty')::int
      )
    )
    FROM jsonb_array_elements(sp->'sizes') sz
  ), '[]'::jsonb) AS sizes,
  c.id AS category_id,
  c.data->>'name' AS category_name,
  sc.id AS subcategory_id,
  sc.data->>'name' AS subcategory_name,
  COALESCE((p.data->>'reviews')::jsonb, '[]'::jsonb) AS reviews,
  COALESCE((p.data->>'questions')::jsonb, '[]'::jsonb) AS questions,
  COALESCE((p.data->>'details')::jsonb, '[]'::jsonb) AS details,
  COALESCE((p.data->>'numReviews')::int, 0) AS num_reviews,
  COALESCE((p.data->>'rating')::float, 0) AS rating,
  COALESCE((p.data->>'discount')::int, 0) AS product_discount,
  COALESCE((p.data->>'sold')::int, 0) AS sold
FROM vendora_vendors v
JOIN vendora_stores s ON s.data->>'owner' = v.id
JOIN vendora_products p ON p.id = ANY (ARRAY(
  SELECT jsonb_array_elements_text(s.data->'products')
))
LEFT JOIN vendora_categories c ON c.id = p.data->>'category'
LEFT JOIN vendora_sub_categories sc ON sc.id = ANY (ARRAY(
  SELECT jsonb_array_elements_text(p.data->'subCategories')
))
CROSS JOIN LATERAL jsonb_array_elements(p.data->'subProducts') sp
WHERE v.data->>'status' = 'approved';
