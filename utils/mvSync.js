import crypto from "crypto";
import { deleteRows, fetchRows, insertRows, patchRows } from "./insforgeClient";

const DEFAULT_LOCALE_ID = "loc_en";
const DEFAULT_CURRENCY_ID = "cur_usd";
const DEFAULT_CHANNEL_ID = "ch_default";
const DEFAULT_VENDOR_ID = "vendor_default";
const DEFAULT_STORE_ID = "store_default";

let contextReady = false;

function makeId(prefix) {
    return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

async function ensureContext() {
    if (contextReady) {
        return;
    }

    await insertRows("mv_locales", [
        {
            id: DEFAULT_LOCALE_ID,
            code: "en",
            name: "English",
            direction: "ltr",
        },
    ]);

    await insertRows("mv_currencies", [
        {
            id: DEFAULT_CURRENCY_ID,
            code: "USD",
            name: "US Dollar",
            symbol: "$",
            decimal_places: 2,
        },
    ]);

    await insertRows("mv_channels", [
        {
            id: DEFAULT_CHANNEL_ID,
            code: "default",
            name: "Default Channel",
            hostname: "localhost",
            timezone: "UTC",
            default_locale_id: DEFAULT_LOCALE_ID,
            base_currency_id: DEFAULT_CURRENCY_ID,
        },
    ]);

    await insertRows("mv_channel_locales", [
        {
            channel_id: DEFAULT_CHANNEL_ID,
            locale_id: DEFAULT_LOCALE_ID,
        },
    ]);

    await insertRows("mv_channel_currencies", [
        {
            channel_id: DEFAULT_CHANNEL_ID,
            currency_id: DEFAULT_CURRENCY_ID,
        },
    ]);

    await insertRows("mv_vendors", [
        {
            id: DEFAULT_VENDOR_ID,
            slug: "default-vendor",
            legal_name: "Default Vendor",
            display_name: "Default Vendor",
            email: "vendor@local.test",
            status: "active",
            verification_status: "verified",
        },
    ]);

    await insertRows("mv_stores", [
        {
            id: DEFAULT_STORE_ID,
            vendor_id: DEFAULT_VENDOR_ID,
            name: "Default Store",
            slug: "default-store",
            status: "active",
        },
    ]);

    contextReady = true;
}

export async function syncCategoryToMv(category) {
    if (!category) {
        return;
    }

    await ensureContext();

    await insertRows("mv_categories", [
        {
            id: category._id,
            parent_id: category.parent || null,
            name: category.name,
            slug: category.slug,
            status: category.status === "inactive" ? "inactive" : "active",
            metadata: {
                showInStore: category.showInStore !== false,
                sortOrder: Number.isFinite(Number(category.sortOrder)) ? Number(category.sortOrder) : 0,
            },
        },
    ]);
}

export async function syncProductToMv(product) {
    if (!product) {
        return;
    }

    await ensureContext();

    const firstSubProduct = Array.isArray(product.subProducts) ? product.subProducts[0] : null;
    const firstSize = firstSubProduct?.sizes?.[0] || {};
    const images = Array.isArray(firstSubProduct?.images) ? firstSubProduct.images : [];

    await insertRows("mv_products", [
        {
            id: product._id,
            sku: firstSubProduct?.sku || product._id,
            type: "simple",
            name: product.name,
            slug: product.slug,
            description: product.description,
            status: "active",
            category_id: product.category || null,
            brand: product.brand || null,
            additional: {
                details: product.details || [],
                questions: product.questions || [],
                subProducts: product.subProducts || [],
            },
        },
    ]);

    if (product.category) {
        await insertRows("mv_product_categories", [
            {
                product_id: product._id,
                category_id: product.category,
            },
        ]);
    }

    await deleteRows("mv_product_media", { product_id: `eq.${product._id}` });

    if (images.length) {
        const mediaRows = images.map((img, index) => ({
            id: makeId("media"),
            product_id: product._id,
            media_type: "image",
            url: img.url || img,
            sort_order: index,
        }));
        await insertRows("mv_product_media", mediaRows, { upsert: false });
    }

    const quantity = (firstSubProduct?.sizes || []).reduce((sum, size) => sum + Number(size.qty || 0), 0);
    const price = Number(firstSize.price || 0);

    await insertRows("mv_vendor_product_offers", [
        {
            id: `${DEFAULT_VENDOR_ID}_${product._id}`,
            vendor_id: DEFAULT_VENDOR_ID,
            product_id: product._id,
            seller_sku: firstSubProduct?.sku || product._id,
            price,
            quantity,
            status: "active",
            approval_status: "approved",
        },
    ]);
}

export async function syncCartToMv({ cartId, userId, products, cartTotal }) {
    await ensureContext();

    await insertRows("mv_carts", [
        {
            id: cartId,
            customer_id: userId,
            channel_id: DEFAULT_CHANNEL_ID,
            currency_code: "USD",
            totals: {
                grand_total: Number(cartTotal || 0),
                sub_total: Number(cartTotal || 0),
            },
            status: "active",
        },
    ]);

    await deleteRows("mv_cart_items", { cart_id: `eq.${cartId}` });

    const items = [];
    for (const product of products) {
        const productId = product.product || product._id;
        const { rows: offers } = await fetchRows("mv_vendor_product_offers", {
            product_id: `eq.${productId}`,
            limit: 1,
        });
        const offer = offers[0] || null;

        items.push({
            id: makeId("cart_item"),
            cart_id: cartId,
            product_id: productId,
            offer_id: offer?.id || null,
            vendor_id: offer?.vendor_id || DEFAULT_VENDOR_ID,
            sku: offer?.seller_sku || productId,
            name: product.name,
            qty: Number(product.qty || 1),
            unit_price: Number(product.price || 0),
            total_price: Number(product.price || 0) * Number(product.qty || 1),
            selected_options: {
                color: product.color,
                size: product.size,
                image: product.image,
            },
        });
    }

    if (items.length) {
        await insertRows("mv_cart_items", items, { upsert: false });
    }
}

export async function syncOrderToMv({ orderId, userId, products, shippingAddress, paymentMethod, total, couponApplied }) {
    await ensureContext();

    const incrementId = `MV-${String(Date.now())}`;

    await insertRows("mv_orders", [
        {
            id: orderId,
            increment_id: incrementId,
            status: "pending",
            channel_id: DEFAULT_CHANNEL_ID,
            customer_id: userId,
            customer_email: null,
            customer_first_name: shippingAddress?.firstName || null,
            customer_last_name: shippingAddress?.lastName || null,
            shipping_address: shippingAddress || {},
            billing_address: shippingAddress || {},
            shipping_method: "standard",
            shipping_title: "Standard Shipping",
            coupon_code: couponApplied || null,
            totals: {
                grand_total: Number(total || 0),
                sub_total: Number(total || 0),
            },
        },
    ]);

    await deleteRows("mv_order_items", { order_id: `eq.${orderId}` });

    const orderItems = [];
    for (const item of products) {
        const productId = item.product || item._id;
        const { rows: offers } = await fetchRows("mv_vendor_product_offers", {
            product_id: `eq.${productId}`,
            limit: 1,
        });
        const offer = offers[0] || null;

        orderItems.push({
            id: makeId("order_item"),
            order_id: orderId,
            product_id: productId,
            offer_id: offer?.id || null,
            vendor_id: offer?.vendor_id || DEFAULT_VENDOR_ID,
            sku: offer?.seller_sku || productId,
            type: "simple",
            name: item.name,
            qty_ordered: Number(item.qty || 1),
            price: Number(item.price || 0),
            base_price: Number(item.price || 0),
            total: Number(item.price || 0) * Number(item.qty || 1),
            base_total: Number(item.price || 0) * Number(item.qty || 1),
            additional: {
                color: item.color,
                size: item.size,
                image: item.image,
            },
        });
    }

    if (orderItems.length) {
        await insertRows("mv_order_items", orderItems, { upsert: false });
    }

    await insertRows("mv_order_payments", [
        {
            id: makeId("payment"),
            order_id: orderId,
            method: paymentMethod || "unknown",
            method_title: paymentMethod || "unknown",
            status: "pending",
            amount: Number(total || 0),
        },
    ]);
}

export async function markOrderPaidInMv(orderId) {
    await patchRows("mv_orders", { id: `eq.${orderId}` }, { status: "paid" });
    await patchRows("mv_order_payments", { order_id: `eq.${orderId}` }, { status: "paid" });
}
