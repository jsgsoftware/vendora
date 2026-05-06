import { fetchAllRows } from "./insforgeClient";
import { filterArray, removeDublicates, randomize } from "./array_utils";
import { getHomeSectionsSafe } from "./homeSections";

function toMap(items, key = "_id") {
    const map = new Map();
    items.forEach((item) => map.set(String(item[key]), item));
    return map;
}

function startsWithAny(value, values) {
    if (!values.length) {
        return true;
    }
    const input = String(value || "").toLowerCase();
    return values.some((v) => input.startsWith(String(v || "").toLowerCase()));
}

function includesText(value, search) {
    if (!search) {
        return true;
    }
    return String(value || "").toLowerCase().includes(String(search).toLowerCase());
}

function normalizeImage(image) {
    if (!image) {
        return { url: "/assets/images/no-image.png" };
    }
    if (typeof image === "string") {
        return { url: image };
    }
    if (image.url) {
        return image;
    }
    return { url: "/assets/images/no-image.png" };
}

function normalizeSubProducts({ row, additional, mediaRows, offerRows }) {
    if (Array.isArray(additional.subProducts) && additional.subProducts.length) {
        return additional.subProducts.map((sp) => ({
            ...sp,
            images: Array.isArray(sp.images)
                ? sp.images.map((img) => normalizeImage(img))
                : [normalizeImage(null)],
            sizes: Array.isArray(sp.sizes) && sp.sizes.length
                ? sp.sizes
                : [{ size: "ONE", qty: 0, price: 0 }],
            color: sp.color || { color: "#000000", image: "" },
            discount: Number(sp.discount || 0),
            sold: Number(sp.sold || 0),
        }));
    }

    const mainImages = mediaRows.length
        ? mediaRows.map((m) => normalizeImage(m.url)).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        : [normalizeImage(null)];

    if (offerRows.length) {
        return offerRows.map((offer) => ({
            sku: offer.seller_sku || row.sku,
            images: mainImages,
            description_images: [],
            color: { color: "#000000", image: mainImages[0]?.url || "" },
            sizes: [{ size: "ONE", qty: Number(offer.quantity || 0), price: Number(offer.price || 0) }],
            discount: 0,
            sold: 0,
        }));
    }

    return [
        {
            sku: row.sku,
            images: mainImages,
            description_images: [],
            color: { color: "#000000", image: mainImages[0]?.url || "" },
            sizes: [{ size: "ONE", qty: 0, price: 0 }],
            discount: 0,
            sold: 0,
        },
    ];
}

function toLegacyProduct(row, categoryMap, subCategoryMap, productMediaByProduct, offersByProduct, userMap) {
    const additional = row.additional || {};
    const categoryObj = categoryMap.get(String(row.category_id || additional.category || "")) || null;
    const subCategoryIds = Array.isArray(additional.subCategories) ? additional.subCategories : [];
    const subCategoryObjects = subCategoryIds
        .map((id) => subCategoryMap.get(String(id)))
        .filter(Boolean);

    const reviews = Array.isArray(additional.reviews) ? additional.reviews : [];
    const hydratedReviews = reviews.map((review) => {
        const reviewById = review.reviewBy?.id || review.reviewBy || "";
        const reviewUser = userMap.get(String(reviewById));
        return {
            ...review,
            reviewBy:
                reviewUser ||
                review.reviewBy || {
                    _id: String(reviewById || "unknown"),
                    name: "Customer",
                    image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
                },
            style: review.style || { color: "", image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg" },
            images: Array.isArray(review.images) ? review.images : [],
            likes: review.likes || { likes: 0 },
        };
    });

    const subProducts = normalizeSubProducts({
        row,
        additional,
        mediaRows: productMediaByProduct.get(String(row.id)) || [],
        offerRows: offersByProduct.get(String(row.id)) || [],
    });

    return {
        _id: row.id,
        id: row.id,
        name: row.name,
        description: row.description || "",
        brand: row.brand || "",
        slug: row.slug,
        category: categoryObj || { _id: row.category_id, slug: "uncategorized", name: "Uncategorized" },
        subCategories: subCategoryObjects,
        details: additional.details || [],
        questions: additional.questions || [],
        reviews: hydratedReviews,
        refundPolicy: additional.refundPolicy || "30 days",
        rating: Number(additional.rating || 0),
        numberReviews: Number(additional.numberReviews || hydratedReviews.length),
        shipping: Number(additional.shipping || 0),
        subProducts,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function loadBaseData() {
    const [mvCategories, mvProducts, mvMedia, mvOffers, legacyUsers] = await Promise.all([
        fetchAllRows("mv_categories"),
        fetchAllRows("mv_products"),
        fetchAllRows("mv_product_media"),
        fetchAllRows("mv_vendor_product_offers"),
        fetchAllRows("vendora_users"),
    ]);

    const categoryItems = mvCategories.map((c) => ({
        _id: c.id,
        id: c.id,
        name: c.name,
        slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, "-") || c.id,
        parent: c.parent_id || null,
        status: c.status || "active",
        showInStore: c?.metadata?.showInStore !== false,
        sortOrder: Number.isFinite(Number(c?.metadata?.sortOrder)) ? Number(c.metadata.sortOrder) : Number.MAX_SAFE_INTEGER,
    }));

    const categories = categoryItems
        .filter((c) => !c.parent && c.status === "active" && c.showInStore)
        .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }
            return String(a.name || "").localeCompare(String(b.name || ""));
        });
    const categoryMap = toMap(categoryItems);
    const subCategories = categoryItems
        .filter((c) => c.parent)
        .map((s) => ({ ...s, parent: categoryMap.get(String(s.parent)) || null }));
    const subCategoryMap = toMap(subCategories);

    const productMediaByProduct = new Map();
    mvMedia.forEach((m) => {
        const key = String(m.product_id);
        if (!productMediaByProduct.has(key)) {
            productMediaByProduct.set(key, []);
        }
        productMediaByProduct.get(key).push(m);
    });

    const offersByProduct = new Map();
    mvOffers.forEach((offer) => {
        const key = String(offer.product_id);
        if (!offersByProduct.has(key)) {
            offersByProduct.set(key, []);
        }
        offersByProduct.get(key).push(offer);
    });

    const userMap = new Map();
    legacyUsers.forEach((u) => {
        const data = u.data || {};
        userMap.set(String(u.id), {
            _id: u.id,
            id: u.id,
            name: data.name || "Customer",
            image: data.image || "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
        });
    });

    const products = mvProducts.map((p) =>
        toLegacyProduct(p, categoryMap, subCategoryMap, productMediaByProduct, offersByProduct, userMap)
    );

    return { categories, subCategories, products };
}

function getAllProductPrices(product) {
    return (product.subProducts || [])
        .flatMap((sp) => (sp.sizes || []).map((size) => Number(size.price || 0)));
}

function getSoldCount(product) {
    return (product.subProducts || []).reduce((sum, sp) => sum + Number(sp.sold || 0), 0);
}

export async function getHomeProducts() {
    const { products } = await loadBaseData();
    return products.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getHomeData() {
    const [{ products, categories }, homeSections] = await Promise.all([
        loadBaseData(),
        getHomeSectionsSafe(),
    ]);
    const sortedProducts = products.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const categoriesWithProducts = categories
        .map((category) => ({
            ...category,
            productCount: sortedProducts.filter((product) => String(product.category?._id) === String(category._id)).length,
        }))
        .filter((category) => category.productCount > 0);

    return {
        products: sortedProducts,
        categories: categoriesWithProducts,
        homeSections,
    };
}

export async function getProductBySlug(slug) {
    const { products } = await loadBaseData();
    return products.find((p) => p.slug === slug) || null;
}

export async function getBrowseData(query) {
    const { categories, subCategories, products } = await loadBaseData();

    const pageSize = 10;
    const page = Number(query.page || 1);

    const selectedBrands = String(query.brand || "").split("_").filter(Boolean);
    const selectedStyles = String(query.style || "").split("_").filter(Boolean);
    const selectedSizes = String(query.size || "").split("_").filter(Boolean);
    const selectedColors = String(query.color || "").split("_").filter(Boolean);
    const selectedMaterials = String(query.material || "").split("_").filter(Boolean);
    const selectedGenders = String(query.gender || "").split("_").filter(Boolean);
    const categoryId = String(query.category || "");
    const searchText = String(query.search || "");
    const sort = String(query.sort || "");
    const shipping = String(query.shipping || "");
    const ratingMin = query.rating ? Number(query.rating) : null;
    const [minPriceRaw, maxPriceRaw] = String(query.price || "").split("_");
    const minPrice = minPriceRaw ? Number(minPriceRaw) : 0;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : Number.POSITIVE_INFINITY;

    const filtered = products.filter((product) => {
        if (!includesText(product.name, searchText)) {
            return false;
        }

        if (categoryId && String(product.category?._id) !== categoryId) {
            return false;
        }

        if (selectedBrands.length && !startsWithAny(product.brand, selectedBrands)) {
            return false;
        }

        const details = Array.isArray(product.details) ? product.details : [];
        const detailValues = details.map((d) => d.value || "");

        if (selectedStyles.length && !detailValues.some((v) => startsWithAny(v, selectedStyles))) {
            return false;
        }

        if (selectedMaterials.length && !detailValues.some((v) => startsWithAny(v, selectedMaterials))) {
            return false;
        }

        if (selectedGenders.length && !detailValues.some((v) => startsWithAny(v, selectedGenders))) {
            return false;
        }

        const sizeValues = (product.subProducts || []).flatMap((sp) => (sp.sizes || []).map((s) => s.size || ""));
        if (selectedSizes.length && !sizeValues.some((s) => startsWithAny(s, selectedSizes))) {
            return false;
        }

        const colorValues = (product.subProducts || []).map((sp) => sp.color?.color || "");
        if (selectedColors.length && !colorValues.some((c) => startsWithAny(c, selectedColors))) {
            return false;
        }

        const prices = getAllProductPrices(product);
        if (!prices.some((price) => price >= minPrice && price <= maxPrice)) {
            return false;
        }

        if (shipping === "0" && Number(product.shipping || 0) !== 0) {
            return false;
        }

        if (ratingMin !== null && Number(product.rating || 0) < ratingMin) {
            return false;
        }

        return true;
    });

    let sorted = [...filtered];
    if (sort === "popular") {
        sorted.sort((a, b) => (Number(b.rating) - Number(a.rating)) || (getSoldCount(b) - getSoldCount(a)));
    } else if (sort === "newest") {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "topSelling") {
        sorted.sort((a, b) => getSoldCount(b) - getSoldCount(a));
    } else if (sort === "topReviewed") {
        sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sort === "priceHighToLow") {
        sorted.sort((a, b) => Math.max(...getAllProductPrices(b), 0) - Math.max(...getAllProductPrices(a), 0));
    } else if (sort === "priceLowToHight") {
        sorted.sort((a, b) => Math.min(...getAllProductPrices(a), Number.POSITIVE_INFINITY) - Math.min(...getAllProductPrices(b), Number.POSITIVE_INFINITY));
    } else {
        sorted = randomize(sorted);
    }

    const pagedProducts = sorted.slice(pageSize * (page - 1), pageSize * page);

    const categoryProducts = categoryId
        ? products.filter((p) => String(p.category?._id) === categoryId)
        : products;

    const colors = removeDublicates(
        categoryProducts.flatMap((p) => (p.subProducts || []).map((sp) => sp.color?.color).filter(Boolean))
    );
    const brands = removeDublicates(categoryProducts.map((p) => p.brand).filter(Boolean));
    const sizes = removeDublicates(
        categoryProducts.flatMap((p) => (p.subProducts || []).flatMap((sp) => (sp.sizes || []).map((s) => s.size))).filter(Boolean)
    );

    const details = removeDublicates(
        categoryProducts.flatMap((p) => p.details || []).map((d) => JSON.stringify({ name: d.name, value: d.value }))
    ).map((raw) => JSON.parse(raw));

    const styles = removeDublicates(filterArray(details, "Style"));
    const materials = removeDublicates(filterArray(details, "Material"));

    return {
        categories,
        subCategories,
        products: pagedProducts,
        sizes,
        colors,
        brands,
        styles,
        materials,
        paginationCount: Math.ceil(filtered.length / pageSize) || 1,
    };
}
