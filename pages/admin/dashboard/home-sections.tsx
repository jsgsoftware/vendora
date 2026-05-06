import { useState } from "react";
import axios from "axios";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    InformationCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/admin/layout/Layout";
import { requirePortalSession } from "@/utils/portalAuth";
import HomeSectionsDocs from "@/components/admin/home-sections/HomeSectionsDocs";

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
            alt: "Hero slide 1"
        },
        {
            image: "/assets/images/slider-2.jpg",
            href: "/",
            alt: "Hero slide 2"
        }
    ]
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

function getSectionPayloadTemplate(type: string) {
    if (type === "hero_carousel") {
        return DEFAULT_HERO_CAROUSEL;
    }
    return type === "sellers_carousel" ? DEFAULT_SELLERS_CAROUSEL : DEFAULT_CARD_GRID;
}

function prettyPayload(payload: any) {
    return JSON.stringify(payload, null, 2);
}

const HomeSectionsPage = ({ initialSections }: any) => {
    const [sections, setSections] = useState(initialSections || []);
    const [type, setType] = useState("card_grid");
    const [title, setTitle] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [payloadText, setPayloadText] = useState(prettyPayload(getSectionPayloadTemplate("card_grid")));
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showDocs, setShowDocs] = useState(false);

    const [editingId, setEditingId] = useState("");
    const [editType, setEditType] = useState("card_grid");
    const [editTitle, setEditTitle] = useState("");
    const [editEnabled, setEditEnabled] = useState(true);
    const [editPayloadText, setEditPayloadText] = useState("");

    const parsePayload = (value: string) => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    const refreshWith = (nextSections: any[]) => {
        setSections(nextSections || []);
        setEditingId("");
    };

    const createSection = async (e: any) => {
        e.preventDefault();
        setErrorMessage("");
        const payload = parsePayload(payloadText);
        if (!payload) {
            alert("Payload JSON invalido.");
            return;
        }
        setSaving(true);
        try {
            const response = await axios.post("/api/admin/home-sections", {
                title,
                type,
                enabled,
                payload,
            });
            refreshWith(response.data.sections);
            setTitle("");
            setEnabled(true);
            setType("card_grid");
            setPayloadText(prettyPayload(getSectionPayloadTemplate("card_grid")));
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                "No se pudo crear la seccion. Revisa que la migracion de InsForge este aplicada.";
            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    };

    const moveSection = async (id: string, direction: "up" | "down") => {
        setErrorMessage("");
        try {
            const response = await axios.put("/api/admin/home-sections", {
                id,
                action: "move",
                direction,
            });
            refreshWith(response.data.sections);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || "No se pudo reordenar la seccion.");
        }
    };

    const removeSection = async (id: string) => {
        if (!window.confirm("Do you want to remove this section?")) {
            return;
        }
        setErrorMessage("");
        try {
            const response = await axios.delete(`/api/admin/home-sections?id=${id}`);
            refreshWith(response.data.sections);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || "No se pudo eliminar la seccion.");
        }
    };

    const startEdit = (section: any) => {
        setEditingId(section.id);
        setEditType(section.type);
        setEditTitle(section.title || "");
        setEditEnabled(section.enabled !== false);
        setEditPayloadText(prettyPayload(section.payload || getSectionPayloadTemplate(section.type)));
    };

    const saveEdit = async () => {
        setErrorMessage("");
        const payload = parsePayload(editPayloadText);
        if (!payload) {
            alert("Payload JSON invalido.");
            return;
        }
        if (Array.isArray(payload.sections) || payload._id || payload.type === "card_grid" || payload.type === "hero_carousel" || payload.type === "sellers_carousel") {
            alert("Error: el campo payload no debe contener metadatos de seccion (type, title, sections, _id). Solo debe tener 'columns' + 'cards' (para card_grid), 'slides' (para hero) o items/mode (para sellers).\n\nTIP: revisa que el JSON no empiece con { \"type\": \"...\" } ni { \"sections\": [...] }.");
            return;
        }

        const body = {
            id: editingId,
            type: editType,
            title: editTitle,
            enabled: editEnabled,
            payload,
        };
        console.log("[frontend saveEdit] sending PUT /api/admin/home-sections", JSON.stringify(body, null, 2));

        try {
            const response = await axios.put("/api/admin/home-sections", body);
            refreshWith(response.data.sections);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || "No se pudo actualizar la seccion.");
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6">
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold text-vendora-ink">Home Sections Builder</h1>
                        <button
                            type="button"
                            onClick={() => setShowDocs(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-vendora px-3 py-2 text-sm font-medium text-vendora-ink hover:bg-gray-50"
                        >
                            <InformationCircleIcon className="w-5 h-5 text-vendora-accent" />
                            Docs Section Home
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Create/remove/reorder homepage blocks (cards + sellers carousel).</p>
                </div>

                {errorMessage && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={createSection} className="bg-white border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Section title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-vendora rounded-md px-3 py-2"
                                placeholder="Optional title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => {
                                    const nextType = e.target.value;
                                    setType(nextType);
                                    setPayloadText(prettyPayload(getSectionPayloadTemplate(nextType)));
                                }}
                                className="w-full border border-vendora rounded-md px-3 py-2"
                            >
                                <option value="card_grid">Card Grid</option>
                                <option value="hero_carousel">Hero Carousel</option>
                                <option value="sellers_carousel">Sellers Carousel</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 md:mt-7">
                            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                            Enabled
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
                        <textarea
                            value={payloadText}
                            onChange={(e) => setPayloadText(e.target.value)}
                            rows={12}
                            className="w-full border border-vendora rounded-md px-3 py-2 font-mono text-xs"
                        />
                    </div>

                    <button disabled={saving} className="button-orange px-4 py-2 rounded-md">
                        {saving ? "Saving..." : "Add Section"}
                    </button>
                </form>

                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Type</div>
                        <div className="col-span-4">Title</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {sections.map((section: any, index: number) => {
                        const isEditing = editingId === section.id;
                        return (
                            <div key={section.id} className="border-b last:border-b-0">
                                <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                                    <div className="col-span-1 text-sm text-gray-500">{index + 1}</div>
                                    <div className="col-span-3 text-sm font-medium text-vendora-ink">{section.type}</div>
                                    <div className="col-span-4 text-sm text-gray-700">{section.title || "-"}</div>
                                    <div className="col-span-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${section.enabled !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {section.enabled !== false ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button
                                            onClick={() => moveSection(section.id, "up")}
                                            className="text-gray-600 hover:text-vendora-accent"
                                            title="Move up"
                                        >
                                            <ArrowUpIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => moveSection(section.id, "down")}
                                            className="text-gray-600 hover:text-vendora-accent"
                                            title="Move down"
                                        >
                                            <ArrowDownIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => startEdit(section)}
                                            className="text-slate-600 hover:text-vendora-accent"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => removeSection(section.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="px-4 pb-4">
                                        <div className="border rounded-md p-3 bg-gray-50 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-medium mb-1">Title</label>
                                                    <input
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full border border-vendora rounded-md px-3 py-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Type</label>
                                                    <select
                                                        value={editType}
                                                        onChange={(e) => setEditType(e.target.value)}
                                                        className="w-full border border-vendora rounded-md px-3 py-2"
                                                    >
                                                        <option value="card_grid">Card Grid</option>
                                                        <option value="hero_carousel">Hero Carousel</option>
                                                        <option value="sellers_carousel">Sellers Carousel</option>
                                                    </select>
                                                </div>
                                                <label className="flex items-center gap-2 text-sm text-gray-700 md:mt-7">
                                                    <input
                                                        type="checkbox"
                                                        checked={editEnabled}
                                                        onChange={(e) => setEditEnabled(e.target.checked)}
                                                    />
                                                    {editEnabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                                                    Enabled
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-1">Payload JSON</label>
                                                <textarea
                                                    rows={12}
                                                    value={editPayloadText}
                                                    onChange={(e) => setEditPayloadText(e.target.value)}
                                                    className="w-full border border-vendora rounded-md px-3 py-2 font-mono text-xs"
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId("")}
                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-gray-700"
                                                >
                                                    <XCircleIcon className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={saveEdit}
                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-vendora-accent text-white"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {!sections.length && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No sections configured yet. Add your first section above.
                        </div>
                    )}
                </div>

                {showDocs && <HomeSectionsDocs onClose={() => setShowDocs(false)} />}
            </div>
        </Layout>
    );
};

export default HomeSectionsPage;

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    let initialSections = [];
    try {
        const { listHomeSections } = await import("@/utils/homeSections");
        initialSections = await listHomeSections();
    } catch {
        initialSections = [];
    }

    return {
        props: {
            initialSections: JSON.parse(JSON.stringify(initialSections)),
        },
    };
}
