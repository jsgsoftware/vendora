import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

function getSoldCount(product: any) {
    return (product?.subProducts || []).reduce(
        (sum: number, sub: any) => sum + Number(sub?.sold || 0),
        0
    );
}

function getPrimaryImage(product: any) {
    return product?.subProducts?.[0]?.images?.[0]?.url || "/assets/images/no-image.png";
}

function pickBestSellers(products: any[], section: any) {
    const payload = section?.payload || {};
    const limit = Math.max(1, Number(payload.limit || 16));
    const categoryId = String(payload.categoryId || "");
    const categorySlug = String(payload.categorySlug || "");

    const filtered = products.filter((product) => {
        const productCategoryId = String(product?.category?._id || "");
        const productCategorySlug = String(product?.category?.slug || "");
        if (categoryId) {
            return productCategoryId === categoryId;
        }
        if (categorySlug) {
            return productCategorySlug === categorySlug;
        }
        return true;
    });

    return filtered
        .sort((a, b) => {
            const soldDelta = getSoldCount(b) - getSoldCount(a);
            if (soldDelta !== 0) {
                return soldDelta;
            }
            return Number(b?.rating || 0) - Number(a?.rating || 0);
        })
        .slice(0, limit);
}

const CardGrid = ({ section, elevated }: any) => {
    const payload = section?.payload || {};
    const cards = Array.isArray(payload.cards) ? payload.cards : [];
    const columns = Math.min(4, Math.max(1, Number(payload.columns || 4)));
    const gridClass = columns === 1
        ? "md:grid-cols-1"
        : columns === 2
            ? "md:grid-cols-2"
            : columns === 3
                ? "md:grid-cols-3"
                : "md:grid-cols-4";

    return (
        <section className={`${elevated ? "-mt-2 sm:-mt-3 md:-mt-6 lg:-mt-8" : ""} z-10 relative p-4 pt-3 md:pt-4`}>
            <div className={`grid grid-cols-1 ${gridClass} gap-4`}>
                {cards.map((card: any, index: number) => {
                    const childCards = Array.isArray(card.items) ? card.items.slice(0, 4) : [];

                    if (card?.variant === "quad") {
                        const items = Array.isArray(card.items) ? card.items.slice(0, 4) : [];
                        return (
                            <article key={`${section.id}-quad-${index}`} className="bg-white rounded-md border p-4 flex flex-col">
                                <h3 className="text-lg font-bold text-vendora-ink mb-4">{card.title}</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {items.map((item: any, itemIndex: number) => (
                                        <Link
                                            key={`${section.id}-quad-item-${itemIndex}`}
                                            href={item?.href || "/"}
                                            className="block"
                                        >
                                            <div className="bg-gray-100 rounded overflow-hidden h-24">
                                                <img
                                                    src={item?.image || "/assets/images/no-image.png"}
                                                    alt={item?.title || "card item"}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 mt-2 h-8 overflow-hidden">{item?.title || "Item"}</p>
                                        </Link>
                                    ))}
                                </div>
                                {(card.footerText || card.footerHref) && (
                                    <Link href={card.footerHref || "/"} className="text-sm text-vendora-accent mt-4 hover:underline">
                                        {card.footerText || "Ver mas"}
                                    </Link>
                                )}
                            </article>
                        );
                    }

                    if (childCards.length > 0) {
                        return (
                            <article key={`${section.id}-parent-${index}`} className="bg-white rounded-md border p-4 flex flex-col">
                                <h3 className="text-lg font-bold text-vendora-ink mb-4">{card?.title}</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {childCards.map((child: any, childIndex: number) => (
                                        <Link
                                            key={`${section.id}-child-${index}-${childIndex}`}
                                            href={child?.href || "/"}
                                            className="block"
                                        >
                                            <div className="bg-gray-100 rounded overflow-hidden h-24">
                                                <img
                                                    src={child?.image || "/assets/images/no-image.png"}
                                                    alt={child?.title || "child card"}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 mt-2 h-8 overflow-hidden">{child?.title || "Item"}</p>
                                        </Link>
                                    ))}
                                </div>
                                {(card?.cta || card?.href) && (
                                    <Link href={card?.href || "/"} className="text-sm text-vendora-accent mt-4 hover:underline">
                                        {card?.cta || "Ver mas"}
                                    </Link>
                                )}
                            </article>
                        );
                    }

                    if (childCards.length > 0) {
                        return (
                            <article key={`${section.id}-parent-${index}`} className="bg-white rounded-md border p-4 flex flex-col">
                                <h3 className="text-lg font-bold text-vendora-ink mb-4">{card?.title}</h3>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {childCards.map((child: any, childIndex: number) => (
                                        <Link
                                            key={`${section.id}-child-${index}-${childIndex}`}
                                            href={child?.href || "/"}
                                            className="block"
                                        >
                                            <div className="bg-gray-100 rounded overflow-hidden h-24">
                                                <img
                                                    src={child?.image || "/assets/images/no-image.png"}
                                                    alt={child?.title || "child card"}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 mt-2 h-8 overflow-hidden">{child?.title || "Item"}</p>
                                        </Link>
                                    ))}
                                </div>
                                {(card?.cta || card?.href) && (
                                    <Link href={card?.href || "/"} className="text-sm text-vendora-accent mt-4 hover:underline">
                                        {card?.cta || "Ver mas"}
                                    </Link>
                                )}
                            </article>
                        );
                    }

                    return (
                        <article key={`${section.id}-fat-${index}`} className="bg-white rounded-md border p-4 flex flex-col">
                            <h3 className="text-lg font-bold text-vendora-ink mb-4">{card?.title}</h3>
                            <Link href={card?.href || "/"} className="block flex-1">
                                <div className="rounded overflow-hidden min-h-[220px] h-full bg-gray-100">
                                    <img
                                        src={card?.image || "/assets/images/no-image.png"}
                                        alt={card?.title || "card image"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {(card?.cta || card?.href) && (
                                    <p className="text-sm text-vendora-accent mt-3 hover:underline">{card?.cta || "Ver mas"}</p>
                                )}
                            </Link>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

const BestSellers = ({ section, products }: any) => {
    const payload = section?.payload || {};
    const title = section?.title || payload?.title || "Los mas vendidos";
    const mode = payload?.mode === "products" ? "products" : "manual";
    const manualItems = Array.isArray(payload?.items)
        ? payload.items.filter((item: any) => item?.image)
        : [];
    const bestSellers = pickBestSellers(products, section);

    if (mode === "manual" && !manualItems.length) {
        return null;
    }

    const shouldUseManualFallback = mode === "products" && !bestSellers.length && manualItems.length > 0;

    if (mode === "products" && !bestSellers.length && !manualItems.length) {
        return null;
    }

    return (
        <section className="mx-4 mb-4 rounded-md border bg-white p-4">
            <h3 className="text-xl font-bold text-vendora-ink mb-4">{title}</h3>
            <Swiper
                navigation
                loop
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                modules={[Navigation, Autoplay]}
                className="products-swiper_home"
                spaceBetween={12}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    900: { slidesPerView: 4 },
                    1200: { slidesPerView: 6 },
                }}
            >
                {(mode === "manual" || shouldUseManualFallback)
                    ? manualItems.map((item: any, index: number) => (
                        <SwiperSlide key={`${section.id}-manual-${index}`}>
                            <Link href={item?.href || "/"} className="group block">
                                <div className="h-52 md:h-56 bg-gray-100 rounded border overflow-hidden">
                                    <img
                                        src={item?.image || "/assets/images/no-image.png"}
                                        alt={item?.label || "carousel item"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        loading="lazy"
                                    />
                                </div>
                                <p className="text-xs text-gray-700 mt-2 h-8 overflow-hidden">{item?.label || ""}</p>
                            </Link>
                        </SwiperSlide>
                    ))
                    : bestSellers.map((product: any) => (
                        <SwiperSlide key={product._id}>
                            <Link href={`/product/${product.slug}`} className="group block">
                                <div className="h-52 md:h-56 bg-gray-100 rounded border overflow-hidden">
                                    <img
                                        src={getPrimaryImage(product)}
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                        loading="lazy"
                                    />
                                </div>
                                <p className="text-xs text-gray-700 mt-2 h-8 overflow-hidden">{product.name}</p>
                            </Link>
                        </SwiperSlide>
                    ))}
            </Swiper>
        </section>
    );
};

const HomeSectionsRenderer = ({ sections = [], products = [] }: any) => {
    return (
        <div className="z-10 relative">
            {sections
                .filter((section: any) => section?.enabled !== false)
                .map((section: any, index: number) => {
                    if (section.type === "sellers_carousel" || section.type === "best_sellers") {
                        return <BestSellers key={section.id} section={section} products={products} />;
                    }
                    return <CardGrid key={section.id} section={section} elevated={index === 0} />;
                })}
        </div>
    );
};

export default HomeSectionsRenderer;
