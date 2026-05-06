# Bagisto -> InsForge Multivendor Blueprint

This project now uses Bagisto (`C:\desarrollos\bagisto`) as business context only.
Implementation is framework-agnostic and runs with Next.js + InsForge.

## Source Modules Reviewed

- Core: locales, currencies, channels, channel translations, core config.
- Product: products, attribute values, product relations/media/reviews.
- Checkout: cart and cart items concepts.
- Sales: orders, order items, payments, invoices, shipments, refunds.
- Tax: tax categories, rates, mappings.
- Inventory: inventory sources.
- Admin config tree: `packages/Webkul/Admin/src/Config/system.php`.

## What Was Implemented Here

- Existing app compatibility tables (JSON wrapper model currently used by app):
  - `categories`, `sub_categories`, `products`, `users`, `carts`, `coupons`, `orders`.
- New multivendor foundation tables (normalized, Bagisto-inspired):
  - `mv_locales`, `mv_currencies`, `mv_channels`, `mv_channel_locales`, `mv_channel_currencies`, `mv_channel_translations`
  - `mv_settings`, `mv_setting_definitions`
  - `mv_tax_categories`, `mv_tax_rates`, `mv_tax_category_rates`
  - `mv_inventory_sources`, `mv_vendor_inventory_sources`
  - `mv_vendors`, `mv_vendor_users`, `mv_vendor_stores`, `mv_vendor_addresses`, `mv_vendor_payout_accounts`
  - `mv_products`, `mv_product_media`, `mv_vendor_product_offers`
  - `mv_carts`, `mv_cart_items`
  - `mv_orders`, `mv_order_items`, `mv_order_payments`
  - `mv_shipments`, `mv_shipment_items`
  - `mv_invoices`, `mv_invoice_items`
  - `mv_refunds`, `mv_refund_items`, `mv_returns`
  - `mv_commissions`, `mv_payouts`, `mv_payout_items`

## Configuration Model

Bagisto stores settings as key/value with channel and locale scope (`core_config`).
This design is now generalized in:

- `mv_settings`
  - `key`, `value`, `value_type`
  - `scope_type` (`global`, `channel`, `vendor`, `store`, `user`)
  - `scope_id`, `channel_code`, `locale_code`
  - `is_secret`, `source`
- `mv_setting_definitions`
  - field metadata (type, validation, options, defaults, scope capabilities).

This supports full admin/vendor/store configuration layers without Laravel.

## Multivendor Commerce Model

- Product catalog is global (`mv_products`).
- Each vendor publishes offers (`mv_vendor_product_offers`) with own price, stock, and approval.
- Order lines carry `vendor_id` (`mv_order_items`) for split fulfillment/accounting.
- Financial settlement is explicit via `mv_commissions` + `mv_payouts`.

## How To Apply Schema

Run once after linking InsForge project:

```bash
npm run insforge:db:setup
```

This executes all SQL files in `insforge/migrations` in filename order.

## Suggested Next Implementation Steps

1. Move runtime reads/writes from JSON compatibility tables to `mv_*` tables.
2. Add vendor onboarding and approval APIs (admin + seller panel).
3. Add split-checkout logic to create per-vendor shipment/invoice/refund flows.
4. Add commission engine and payout scheduler.
5. Add settings UI backed by `mv_setting_definitions` and `mv_settings`.
