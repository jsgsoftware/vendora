import crypto from "crypto";
import { fetchAllRows, fetchRows, insertRows, patchRows } from "./insforgeClient";

function makeId(prefix) {
    return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export async function getVendorMembership(userId) {
    const { rows } = await fetchRows("mv_vendor_users", {
        user_id: `eq.${userId}`,
        limit: 1,
    });
    return rows[0] || null;
}

export async function getVendorById(vendorId) {
    const { rows } = await fetchRows("mv_vendors", {
        id: `eq.${vendorId}`,
        limit: 1,
    });
    return rows[0] || null;
}

export async function ensureVendorForUser({ userId, email, name, storeName }) {
    let membership = await getVendorMembership(userId);
    if (membership) {
        return membership;
    }

    const safeSlug = String(storeName || name || email || "vendor")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40);

    const baseUserId = String(userId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const vendorId = `vendor_${baseUserId || crypto.randomBytes(6).toString("hex")}`;
    const storeId = `store_${baseUserId || crypto.randomBytes(6).toString("hex")}`;
    const vendorUserId = `vuser_${baseUserId || crypto.randomBytes(6).toString("hex")}`;
    const uniqueSuffix = crypto.randomBytes(2).toString("hex");

    await insertRows("mv_vendors", [
        {
            id: vendorId,
            slug: `${safeSlug || "vendor"}-${uniqueSuffix}`,
            legal_name: name || email || "Vendor",
            display_name: storeName || name || "Vendor Store",
            email: email || `${vendorId}@local.test`,
            status: "active",
            verification_status: "verified",
        },
    ]);

    await insertRows("mv_vendor_users", [
        {
            id: vendorUserId,
            vendor_id: vendorId,
            user_id: userId,
            email: email || `${vendorId}@local.test`,
            role: "owner",
            status: "active",
        },
    ]);

    await insertRows("mv_stores", [
        {
            id: storeId,
            vendor_id: vendorId,
            name: storeName || `${name || "Vendor"} Store`,
            slug: `${safeSlug || "store"}-${uniqueSuffix}`,
            status: "active",
        },
    ]);

    membership = await getVendorMembership(userId);
    return membership;
}

export async function getVendorStore(vendorId) {
    const { rows } = await fetchRows("mv_stores", {
        vendor_id: `eq.${vendorId}`,
        limit: 1,
    });
    return rows[0] || null;
}

export async function upsertVendorStore(vendorId, payload) {
    const existing = await getVendorStore(vendorId);
    const sanitizedSlug = String(payload.slug || payload.name || "store")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 50);

    if (!existing) {
        const row = {
            id: makeId("store"),
            vendor_id: vendorId,
            name: payload.name,
            slug: sanitizedSlug || makeId("store"),
            description: payload.description || "",
            logo_url: payload.logo_url || null,
            banner_url: payload.banner_url || null,
            status: "active",
        };
        await insertRows("mv_stores", [row]);
        return row;
    }

    await patchRows(
        "mv_stores",
        { id: `eq.${existing.id}` },
        {
            name: payload.name || existing.name,
            slug: sanitizedSlug || existing.slug,
            description: payload.description ?? existing.description,
            logo_url: payload.logo_url ?? existing.logo_url,
            banner_url: payload.banner_url ?? existing.banner_url,
            status: payload.status || existing.status || "active",
        }
    );

    return {
        ...existing,
        ...payload,
        slug: sanitizedSlug || existing.slug,
    };
}

export async function getAdminOverview(vendorId = null) {
    const [vendors, offers, orders, orderItems, products] = await Promise.all([
        fetchAllRows("mv_vendors"),
        fetchAllRows("mv_vendor_product_offers"),
        fetchAllRows("mv_orders"),
        fetchAllRows("mv_order_items"),
        fetchAllRows("mv_products"),
    ]);

    const scopedOffers = vendorId ? offers.filter((o) => o.vendor_id === vendorId) : offers;
    const scopedItems = vendorId ? orderItems.filter((o) => o.vendor_id === vendorId) : orderItems;
    const scopedOrderIds = new Set(scopedItems.map((o) => o.order_id));
    const scopedOrders = vendorId ? orders.filter((o) => scopedOrderIds.has(o.id)) : orders;
    const productIds = new Set(scopedOffers.map((o) => o.product_id));
    const scopedProducts = products.filter((p) => productIds.has(p.id));

    const grossSales = scopedItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const paidOrders = scopedOrders.filter((o) => String(o.status || "").toLowerCase() === "paid").length;

    return {
        vendors,
        metrics: {
            vendors: vendorId ? 1 : vendors.length,
            stores: vendorId
                ? (await fetchRows("mv_stores", { vendor_id: `eq.${vendorId}` })).rows.length
                : (await fetchAllRows("mv_stores")).length,
            offers: scopedOffers.length,
            products: scopedProducts.length,
            orders: scopedOrders.length,
            paidOrders,
            grossSales,
        },
    };
}

export async function getVendorOverview(vendorId) {
    const [vendor, store, offers, products, orderItems, reviews, comments] = await Promise.all([
        getVendorById(vendorId),
        getVendorStore(vendorId),
        fetchRows("mv_vendor_product_offers", { vendor_id: `eq.${vendorId}` }).then((r) => r.rows),
        fetchAllRows("mv_products"),
        fetchRows("mv_order_items", { vendor_id: `eq.${vendorId}` }).then((r) => r.rows),
        fetchAllRows("mv_products"),
        Promise.resolve([]), // mv_order_comments does not exist yet
    ]);

    const productIds = new Set(offers.map((o) => o.product_id));
    const vendorProducts = products.filter((p) => productIds.has(p.id));
    const vendorReviews = reviews.flatMap((p) => {
        if (!productIds.has(p.id)) {
            return [];
        }
        const additional = p.additional || {};
        return (additional.reviews || []).map((review) => ({
            ...review,
            productName: p.name,
            productId: p.id,
        }));
    });

    const grossSales = orderItems.reduce((sum, item) => sum + Number(item.total || 0), 0);

    return {
        vendor,
        store,
        offers,
        vendorProducts,
        orderItems,
        vendorReviews,
        comments,
        metrics: {
            products: vendorProducts.length,
            offers: offers.length,
            orders: new Set(orderItems.map((i) => i.order_id)).size,
            grossSales,
            reviews: vendorReviews.length,
            comments: comments.length,
        },
    };
}
