-- =============================================================================
-- VENDORA SEED DATA
-- ============================================================================

INSERT INTO vendora_categories (id, data) VALUES
('cat_electronics', jsonb_build_object(
  'name', 'Electronics',
  'slug', 'electronics',
  'image', 'https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg',
  'subCategories', ARRAY[
    jsonb_build_object('_id', 'sub_smartphones',   'name', 'Smartphones',   'slug', 'smartphones'),
    jsonb_build_object('_id', 'sub_laptops',       'name', 'Laptops',       'slug', 'laptops'),
    jsonb_build_object('_id', 'sub_accessories',   'name', 'Accessories', 'slug', 'accessories')
  ]
)),
('cat_fashion', jsonb_build_object(
  'name', 'Fashion',
  'slug', 'fashion',
  'image', 'https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg',
  'subCategories', ARRAY[
    jsonb_build_object('_id', 'sub_men',     'name', 'Men',     'slug', 'men'),
    jsonb_build_object('_id', 'sub_women',   'name', 'Women',   'slug', 'women'),
    jsonb_build_object('_id', 'sub_kids',    'name', 'Kids',    'slug', 'kids')
  ]
)),
('cat_home', jsonb_build_object(
  'name', 'Home & Kitchen',
  'slug', 'home-kitchen',
  'image', 'https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg',
  'subCategories', ARRAY[
    jsonb_build_object('_id', 'sub_furniture', 'name', 'Furniture', 'slug', 'furniture'),
    jsonb_build_object('_id', 'sub_decor',     'name', 'Decor',     'slug', 'decor')
  ]
))
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendora_sub_categories (id, data) VALUES
('sub_smartphones', jsonb_build_object('name','Smartphones','slug','smartphones','parent','cat_electronics')),
('sub_laptops',     jsonb_build_object('name','Laptops','slug','laptops','parent','cat_electronics')),
('sub_accessories', jsonb_build_object('name','Accessories','slug','accessories','parent','cat_electronics')),
('sub_men',         jsonb_build_object('name','Men','slug','men','parent','cat_fashion')),
('sub_women',       jsonb_build_object('name','Women','slug','women','parent','cat_fashion')),
('sub_kids',        jsonb_build_object('name','Kids','slug','kids','parent','cat_fashion')),
('sub_furniture',   jsonb_build_object('name','Furniture','slug','furniture','parent','cat_home')),
('sub_decor',       jsonb_build_object('name','Decor','slug','decor','parent','cat_home'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendora_products (id, data) VALUES
('prod_iphone15', jsonb_build_object(
  'name', 'Apple iPhone 15 Pro Max',
  'description', 'Latest iPhone with A17 Pro chip.',
  'brand', 'Apple', 'slug', 'apple-iphone-15-pro-max',
  'category', 'cat_electronics', 'subCategories', ARRAY['sub_smartphones'],
  'price', 1199.00, 'discount', 0,
  'images', ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],
  'colors', ARRAY[jsonb_build_object('_id','col_black','name','Natural Titanium','colorImage','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('_id','col_blue','name','Blue Titanium','colorImage','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],
  'sizes', ARRAY[jsonb_build_object('_id','sz_128gb','name','128GB','price',1199),jsonb_build_object('_id','sz_256gb','name','256GB','price',1299)],
  'details', ARRAY[]::jsonb[], 'reviews', ARRAY[]::jsonb[], 'questions', ARRAY[]::jsonb[],
  'shipping', jsonb_build_object('shippingFee',0,'shippingTime','1-2 days'),
  'rating', 4.8, 'numReviews', 0, 'featured', true, 'new', true, 'sku', 'APL-IPH15-001',
  'subProducts', ARRAY[
    jsonb_build_object('sku','APL-IPH15-BLK','color','Natural Titanium','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[jsonb_build_object('size','128GB','qty',10,'price',1199)]),
    jsonb_build_object('sku','APL-IPH15-BLU','color','Blue Titanium','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[jsonb_build_object('size','256GB','qty',15,'price',1299)])
  ]
)),
('prod_macbook', jsonb_build_object(
  'name', 'MacBook Pro 14" M3',
  'description', 'Supercharged by M3 chip.',
  'brand', 'Apple', 'slug', 'macbook-pro-14-m3',
  'category', 'cat_electronics', 'subCategories', ARRAY['sub_laptops'],
  'price', 1599.00, 'discount', 100,
  'images', ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('url','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg')],
  'colors', ARRAY[jsonb_build_object('_id','col_space','name','Space Gray','colorImage','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('_id','col_silver','name','Silver','colorImage','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg')],
  'sizes', ARRAY[jsonb_build_object('_id','sz_8gb','name','8GB RAM','price',1599),jsonb_build_object('_id','sz_16gb','name','16GB RAM','price',1799)],
  'details', ARRAY[]::jsonb[], 'reviews', ARRAY[]::jsonb[], 'questions', ARRAY[]::jsonb[],
  'shipping', jsonb_build_object('shippingFee',0,'shippingTime','2-3 days'),
  'rating', 0, 'numReviews', 0, 'featured', true, 'new', false, 'sku', 'APL-MBP14-001',
  'subProducts', ARRAY[jsonb_build_object('sku','APL-MBP14-SG','color','Space Gray','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[jsonb_build_object('size','8GB RAM','qty',10,'price',1599),jsonb_build_object('size','16GB RAM','qty',5,'price',1799)])]
)),
('prod_nike', jsonb_build_object(
  'name', 'Nike Air Max 90',
  'description', 'Classic Nike sneakers.',
  'brand', 'Nike', 'slug', 'nike-air-max-90',
  'category', 'cat_fashion', 'subCategories', ARRAY['sub_men','sub_women'],
  'price', 129.99, 'discount', 20,
  'images', ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('url','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg')],
  'colors', ARRAY[jsonb_build_object('_id','col_white','name','White','colorImage','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('_id','col_black','name','Black','colorImage','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg')],
  'sizes', ARRAY[jsonb_build_object('_id','sz_8','name','US 8','price',129.99),jsonb_build_object('_id','sz_9','name','US 9','price',129.99),jsonb_build_object('_id','sz_10','name','US 10','price',129.99)],
  'details', ARRAY[]::jsonb[], 'reviews', ARRAY[]::jsonb[], 'questions', ARRAY[]::jsonb[],
  'shipping', jsonb_build_object('shippingFee',5,'shippingTime','3-5 days'),
  'rating', 0, 'numReviews', 0, 'featured', false, 'new', true, 'sku', 'NIK-AM90-001',
  'subProducts', ARRAY[
    jsonb_build_object('sku','NIK-AM90-WHI','color','White','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[jsonb_build_object('size','US 8','qty',20,'price',129.99)]),
    jsonb_build_object('sku','NIK-AM90-BLK','color','Black','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/61jLiCovxVL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[jsonb_build_object('size','US 10','qty',15,'price',129.99)])
  ]
)),
('prod_sofa', jsonb_build_object(
  'name', 'Modern Velvet Sofa 3-Seater',
  'description', 'Luxurious modern velvet sofa.',
  'brand', 'HomeStyle', 'slug', 'modern-velvet-sofa-3-seater',
  'category', 'cat_home', 'subCategories', ARRAY['sub_furniture'],
  'price', 899.00, 'discount', 150,
  'images', ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('url','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg')],
  'colors', ARRAY[jsonb_build_object('_id','col_green','name','Emerald Green','colorImage','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('_id','col_navy','name','Navy Blue','colorImage','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg')],
  'sizes', ARRAY[]::jsonb[],
  'details', ARRAY[]::jsonb[], 'reviews', ARRAY[]::jsonb[], 'questions', ARRAY[]::jsonb[],
  'shipping', jsonb_build_object('shippingFee',50,'shippingTime','7-10 days'),
  'rating', 0, 'numReviews', 0, 'featured', true, 'new', false, 'sku', 'HOM-SFA3S-001',
  'subProducts', ARRAY[
    jsonb_build_object('sku','HOM-SFA3S-GRN','color','Emerald Green','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[]::jsonb[]),
    jsonb_build_object('sku','HOM-SFA3S-NVY','color','Navy Blue','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71IiQaqnMpL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[]::jsonb[])
  ]
)),
('prod_headphones', jsonb_build_object(
  'name', 'Sony WH-1000XM5 Noise Cancelling',
  'description', 'Industry-leading noise canceling.',
  'brand', 'Sony', 'slug', 'sony-wh-1000xm5',
  'category', 'cat_electronics', 'subCategories', ARRAY['sub_accessories'],
  'price', 348.00, 'discount', 50,
  'images', ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg'),jsonb_build_object('url','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg')],
  'colors', ARRAY[jsonb_build_object('_id','col_black','name','Black','colorImage','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],
  'sizes', ARRAY[]::jsonb[],
  'details', ARRAY[]::jsonb[],
  'reviews', ARRAY[jsonb_build_object('_id','rev2','reviewBy','user_customer','rating',5,'comment','Best headphones ever!','images',ARRAY[]::jsonb[],'createdAt','2026-02-20T14:00:00Z','likes',8)],
  'questions', ARRAY[]::jsonb[],
  'shipping', jsonb_build_object('shippingFee',0,'shippingTime','1-2 days'),
  'rating', 5.0, 'numReviews', 1, 'featured', false, 'new', true, 'sku', 'SNY-WHXM5-001',
  'subProducts', ARRAY[jsonb_build_object('sku','SNY-WHXM5-BLK','color','Black','images',ARRAY[jsonb_build_object('url','https://m.media-amazon.com/images/I/71+i8lOodBL._AC_UL640_FMwebp_QL65_.jpg')],'sizes',ARRAY[]::jsonb[])]
))
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendora_home_sections (id, data) VALUES
('hero_banner', jsonb_build_object('sectionType','hero','title','Vendora Spring Sale','subtitle','Up to 50% off','image','https://m.media-amazon.com/images/I/71S6sIP6esL._AC_UL640_FMwebp_QL65_.jpg','link','/browse','active',true,'order',1)),
('featured_products', jsonb_build_object('sectionType','featured','title','Featured Products','active',true,'order',2,'productIds',ARRAY['prod_iphone15','prod_macbook','prod_sofa'])),
('flash_sale', jsonb_build_object('sectionType','flash_sale','title','Flash Sale','subtitle','Ends in 24 hours','active',true,'order',3,'productIds',ARRAY['prod_iphone15','prod_headphones','prod_nike'])),
('new_arrivals', jsonb_build_object('sectionType','new_arrivals','title','New Arrivals','active',true,'order',4,'productIds',ARRAY['prod_iphone15','prod_headphones','prod_nike'])),
('category_grid', jsonb_build_object('sectionType','categories','title','Shop by Category','active',true,'order',5,'categoryIds',ARRAY['cat_electronics','cat_fashion','cat_home']))
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendora_coupons (id, data) VALUES
('coupon_10off', jsonb_build_object('name','WELCOME10','code','WELCOME10','discount',10,'discountType','percentage','minimumOrder',50,'expiryDate','2026-12-31T23:59:59Z','active',true,'maxUses',1000,'usedCount',0)),
('coupon_20flash', jsonb_build_object('name','FLASH20','code','FLASH20','discount',20,'discountType','percentage','minimumOrder',100,'expiryDate','2026-05-31T23:59:59Z','active',true,'maxUses',500,'usedCount',0))
ON CONFLICT (id) DO NOTHING;

INSERT INTO mv_vendors (id, name, email, password_hash, status, verification, settings, analytics, legal) VALUES
('vendor_demo_1', 'Demo Electronics', 'vendor1@demo.com', '', 'active', '{}', '{}', '{}', '{}'),
('vendor_demo_2', 'Fashion Hub', 'vendor2@demo.com', '', 'active', '{}', '{}', '{}', '{}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mv_stores (id, vendor_id, name, slug, description, logo_url, cover_url, status, settings) VALUES
('store_demo_1', 'vendor_demo_1', 'Demo Electronics Store', 'demo-electronics-store', 'Best electronics', 'https://via.placeholder.com/150', 'https://via.placeholder.com/800x200', 'active', '{}'),
('store_demo_2', 'vendor_demo_2', 'Fashion Hub Demo', 'fashion-hub-demo', 'Fashion demo', 'https://via.placeholder.com/150', 'https://via.placeholder.com/800x200', 'active', '{}')
ON CONFLICT (id) DO NOTHING;
