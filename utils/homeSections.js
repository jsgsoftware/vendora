import crypto from "crypto";
import { fetchAllRows, insertRows, patchRows, deleteRows } from "./insforgeClient";

const DEFAULT_CARD_GRID = {
    columns: 4,
    cards: [
        {
            variant: "fat",
            title: "Destacados de la semana",
            image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80",
            href: "/",
            cta: "Comprar ahora",
        },
    ],
};

const DEFAULT_HERO_CAROUSEL = {
    slides: [
        {
            image: "/assets/images/slider-1.jpg",
            href: "/",
            alt: "Hero slide 1",
        },
        {
            image: "/assets/images/slider-2.jpg",
            href: "/",
            alt: "Hero slide 2",
        },
    ],
};

const DEFAULT_SELLERS_CAROUSEL = {
    mode: "manual",
    title: "Los mas vendidos",
    categoryId: "",
    categorySlug: "",
    limit: 16,
    items: [
        {
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
            href: "/",
            label: "Oferta destacada",
        },
    ],
};

function normalizeCard(card = {}) {
    const rawChildren = Array.isArray(card.items)
        ? card.items
        : Array.isArray(card.cards)
        ? card.cards
        : [];

    const childCards = rawChildren.slice(0, 4).map((child) => ({
        title: child?.title || child?.label || "",
        image: child?.image || "",
        href: child?.href || "/",
        cta: child?.cta || "",
    }));

    const variant = card.variant === "quad" ? "quad" : "fat";
    if (variant === "quad") {
        const items = rawChildren.slice(0, 4);
        return {
            variant,
            title: card.title || "",
            footerText: card.footerText || "",
            footerHref: card.footerHref || "/",
            items: items.map((item) => ({
                title: item?.title || item?.label || "",
                image: item?.image || "",
                href: item?.href || "/",
                cta: item?.cta || "",
            })),
        };
    }

    return {
        variant,
        title: card.title || "",
        image: card.image || "",
        href: card.href || "/",
        cta: card.cta || "",
        items: childCards,
    };
}

function normalizePayload(type, payload = {}) {
    if (type === "hero_carousel") {
        const slides = Array.isArray(payload.slides)
            ? payload.slides.slice(0, 12).map((slide) => ({
                image: slide?.image || "",
                href: slide?.href || "/",
                alt: slide?.alt || "hero slide",
            })).filter((slide) => slide.image)
            : [];

        return {
            slides: slides.length ? slides : DEFAULT_HERO_CAROUSEL.slides,
        };
    }

    if (type === "sellers_carousel") {
        const items = Array.isArray(payload.items)
            ? payload.items.map((item) => ({
                image: item?.image || "",
                href: item?.href || "/",
                label: item?.label || "",
            }))
            : [];

        return {
            mode: payload.mode === "manual" ? "manual" : "products",
            title: payload.title || DEFAULT_SELLERS_CAROUSEL.title,
            categoryId: payload.categoryId || "",
            categorySlug: payload.categorySlug || "",
            limit: Number(payload.limit || DEFAULT_SELLERS_CAROUSEL.limit),
            items,
        };
    }

    const cards = Array.isArray(payload.cards) ? payload.cards.map(normalizeCard) : DEFAULT_CARD_GRID.cards;
    return {
        columns: Math.min(4, Math.max(1, Number(payload.columns || DEFAULT_CARD_GRID.columns))),
        cards,
    };
}

function normalizeSection(row, fallbackPosition = 0) {
    const data = row?.data || {};
    const type = data.type === "hero_carousel"
        ? "hero_carousel"
        : (data.type === "best_sellers" || data.type === "sellers_carousel")
        ? "sellers_carousel"
        : "card_grid";
    return {
        _id: row.id,
        id: row.id,
        title: data.title || "",
        type,
        enabled: data.enabled !== false,
        position: Number(data.position ?? fallbackPosition),
        payload: normalizePayload(type, data.payload || {}),
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
    };
}

function toPersisted(section) {
    const now = new Date().toISOString();
    return {
        title: section.title || "",
        type: section.type,
        enabled: section.enabled !== false,
        position: Number(section.position || 0),
        payload: normalizePayload(section.type, section.payload || {}),
        createdAt: section.createdAt || now,
        updatedAt: now,
    };
}

async function fetchRawSections() {
    const rows = await fetchAllRows("vendora_home_sections");
    return rows
        .map((row, index) => normalizeSection(row, index))
        .sort((a, b) => {
            if (a.type === "hero_carousel" && b.type !== "hero_carousel") {
                return -1;
            }
            if (a.type !== "hero_carousel" && b.type === "hero_carousel") {
                return 1;
            }
            return a.position - b.position;
        });
}

async function persistOrderedSections(sections) {
    for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        if (section.position !== index) {
            const updated = {
                ...section,
                position: index,
                updatedAt: new Date().toISOString(),
            };
            await patchRows("vendora_home_sections", { id: `eq.${section.id}` }, { data: toPersisted(updated) });
            section.position = index;
        }
    }
}

function orderWithHeroFirst(sections) {
    const hero = sections.find((section) => section.type === "hero_carousel");
    const nonHero = sections.filter((section) => section.type !== "hero_carousel");
    return hero ? [hero, ...nonHero] : nonHero;
}

async function reindexSections(sections) {
    const sorted = [...sections].sort((a, b) => a.position - b.position);
    for (let index = 0; index < sorted.length; index += 1) {
        const section = sorted[index];
        if (section.position !== index) {
            const updated = {
                ...section,
                position: index,
                updatedAt: new Date().toISOString(),
            };
            await patchRows("vendora_home_sections", { id: `eq.${section.id}` }, { data: toPersisted(updated) });
            section.position = index;
        }
    }
    return sorted;
}

export function getSectionPayloadTemplate(type) {
    if (type === "hero_carousel") {
        return DEFAULT_HERO_CAROUSEL;
    }
    if (type === "sellers_carousel") {
        return DEFAULT_SELLERS_CAROUSEL;
    }
    return DEFAULT_CARD_GRID;
}

export async function getHomeSectionsSafe() {
    try {
        return await fetchRawSections();
    } catch {
        return [];
    }
}

export async function listHomeSections() {
    return fetchRawSections();
}

export async function createHomeSection(input = {}) {
    const sections = await fetchRawSections();
    const id = crypto.randomBytes(12).toString("hex");
    const type = input.type === "hero_carousel"
        ? "hero_carousel"
        : input.type === "sellers_carousel"
        ? "sellers_carousel"
        : "card_grid";

    if (type === "hero_carousel" && sections.some((section) => section.type === "hero_carousel")) {
        const error = new Error("Only one Hero Carousel is allowed.");
        error.code = 400;
        throw error;
    }

    const section = {
        id,
        title: input.title || "",
        type,
        enabled: input.enabled !== false,
        position: sections.length,
        payload: normalizePayload(type, input.payload || {}),
    };

    await insertRows("vendora_home_sections", [
        {
            id,
            data: toPersisted(section),
        },
    ]);

    const updatedSections = await fetchRawSections();
    const ordered = orderWithHeroFirst(updatedSections);
    await persistOrderedSections(ordered);
    return fetchRawSections();
}

export async function updateHomeSection(id, updates = {}) {
    const sections = await fetchRawSections();
    const current = sections.find((section) => String(section.id) === String(id));
    if (!current) {
        const error = new Error("Section not found");
        error.code = 404;
        throw error;
    }

    const nextType = updates.type
        ? (updates.type === "hero_carousel"
            ? "hero_carousel"
            : updates.type === "sellers_carousel"
            ? "sellers_carousel"
            : "card_grid")
        : current.type;

    if (
        nextType === "hero_carousel" &&
        sections.some((section) => section.type === "hero_carousel" && String(section.id) !== String(id))
    ) {
        const error = new Error("Only one Hero Carousel is allowed.");
        error.code = 400;
        throw error;
    }

    const merged = {
        ...current,
        ...updates,
        type: nextType,
        payload: normalizePayload(nextType, updates.payload ?? current.payload),
        updatedAt: new Date().toISOString(),
    };

    await patchRows("vendora_home_sections", { id: `eq.${id}` }, { data: toPersisted(merged) });

    const updatedSections = await fetchRawSections();
    const ordered = orderWithHeroFirst(updatedSections);
    await persistOrderedSections(ordered);
    return fetchRawSections();
}

export async function deleteHomeSection(id) {
    await deleteRows("vendora_home_sections", { id: `eq.${id}` });
    const sections = await fetchRawSections();
    await reindexSections(orderWithHeroFirst(sections));
    return fetchRawSections();
}

export async function moveHomeSection(id, direction) {
    const sections = await fetchRawSections();
    const current = sections.find((section) => String(section.id) === String(id));
    if (!current) {
        const error = new Error("Section not found");
        error.code = 404;
        throw error;
    }

    if (current.type === "hero_carousel") {
        return orderWithHeroFirst(sections);
    }

    const hero = sections.find((section) => section.type === "hero_carousel");
    const nonHero = sections.filter((section) => section.type !== "hero_carousel");
    const index = nonHero.findIndex((section) => String(section.id) === String(id));
    if (index === -1) {
        return orderWithHeroFirst(sections);
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nonHero.length) {
        return orderWithHeroFirst(sections);
    }

    const reorderedNonHero = [...nonHero];
    const [item] = reorderedNonHero.splice(index, 1);
    reorderedNonHero.splice(targetIndex, 0, item);

    const reordered = hero ? [hero, ...reorderedNonHero] : reorderedNonHero;

    await persistOrderedSections(reordered);

    return orderWithHeroFirst(await fetchRawSections());
}
