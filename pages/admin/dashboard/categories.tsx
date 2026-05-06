import { useMemo, useState } from "react";
import axios from "axios";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    NoSymbolIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/admin/layout/Layout";
import db from "../../../utils/db";
import Category from "../../../models/Category";
import { requirePortalSession } from "@/utils/portalAuth";

const Categories = ({ categories }: any) => {
    const [data, setData] = useState(categories || []);
    const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
    const [name, setName] = useState("");
    const [showInStore, setShowInStore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState("");
    const [editingName, setEditingName] = useState("");

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
            const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return String(a.name || "").localeCompare(String(b.name || ""));
        });
    }, [data]);

    const activeCategories = useMemo(
        () => sortedData.filter((cat: any) => (cat.status || "active") === "active"),
        [sortedData]
    );
    const inactiveCategories = useMemo(
        () => sortedData.filter((cat: any) => (cat.status || "active") !== "active"),
        [sortedData]
    );
    const visibleData = activeTab === "active" ? activeCategories : inactiveCategories;

    const createCategory = async (e: any) => {
        e.preventDefault();
        if (!name.trim()) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("/api/admin/category", {
                name: name.trim(),
                showInStore,
            });
            setData(response.data.categories || []);
            setName("");
            setShowInStore(true);
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (id: string, payload: any) => {
        const response = await axios.put("/api/admin/category", { id, ...payload });
        setData(response.data.categories || []);
    };

    return (
        <Layout>
            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-bold text-vendora-ink">Category Management</h1>
                <p className="text-sm text-gray-600 mt-1">Create, edit, disable and choose if category appears on storefront.</p>

                <form onSubmit={createCategory} className="mt-6 bg-white border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Category name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-vendora rounded-md px-3 py-2"
                            placeholder="e.g. Electronics"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={showInStore}
                            onChange={(e) => setShowInStore(e.target.checked)}
                        />
                        Show on storefront
                    </label>
                    <button
                        disabled={loading}
                        className="button-orange px-4 py-2 rounded-md"
                    >
                        {loading ? "Saving..." : "Add Category"}
                    </button>
                </form>

                <div className="mt-6 bg-white border rounded-lg overflow-hidden">
                    <div className="px-4 pt-4">
                        <div className="inline-flex rounded-md border bg-gray-50 p-1">
                            <button
                                onClick={() => setActiveTab("active")}
                                className={`px-3 py-1.5 text-sm rounded-md ${activeTab === "active" ? "bg-vendora-accent text-white" : "text-gray-700"}`}
                            >
                                Active ({activeCategories.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("inactive")}
                                className={`px-3 py-1.5 text-sm rounded-md ${activeTab === "inactive" ? "bg-vendora-accent text-white" : "text-gray-700"}`}
                            >
                                Inactive ({inactiveCategories.length})
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Slug</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Storefront</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {visibleData.map((cat: any, index: number) => {
                        const isEditing = editingId === cat._id;
                        const isActive = (cat.status || "active") === "active";
                        const visible = cat.showInStore !== false;

                        return (
                            <div key={cat._id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b last:border-b-0">
                                <div className="col-span-1 text-xs text-gray-500">{index + 1}</div>
                                <div className="col-span-3">
                                    {isEditing ? (
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="w-full border border-vendora rounded px-2 py-1"
                                        />
                                    ) : (
                                        <span className="font-medium text-vendora-ink">{cat.name}</span>
                                    )}
                                </div>
                                <div className="col-span-3 text-gray-600 text-sm">{cat.slug}</div>
                                <div className="col-span-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <button
                                        onClick={() => updateCategory(cat._id, { showInStore: !visible })}
                                        className="text-sm flex items-center gap-1 text-gray-700 hover:text-vendora-accent"
                                    >
                                        {visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                                        {visible ? "Visible" : "Hidden"}
                                    </button>
                                </div>
                                <div className="col-span-1 flex justify-end gap-2">
                                    {activeTab === "active" && (
                                        <>
                                            <button
                                                onClick={() => updateCategory(cat._id, { action: "move", direction: "up" })}
                                                className="text-gray-600 hover:text-vendora-accent"
                                                title="Move up"
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => updateCategory(cat._id, { action: "move", direction: "down" })}
                                                className="text-gray-600 hover:text-vendora-accent"
                                                title="Move down"
                                            >
                                                <ArrowDownIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {isEditing ? (
                                        <button
                                            onClick={() => {
                                                updateCategory(cat._id, { name: editingName.trim() || cat.name });
                                                setEditingId("");
                                                setEditingName("");
                                            }}
                                            className="text-green-600 hover:text-green-800"
                                            title="Save"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(cat._id);
                                                setEditingName(cat.name);
                                            }}
                                            className="text-slate-600 hover:text-vendora-accent"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => updateCategory(cat._id, { status: isActive ? "inactive" : "active" })}
                                        className={isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                                        title={isActive ? "Disable" : "Enable"}
                                    >
                                        <NoSymbolIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {!visibleData.length && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">No categories in this tab.</div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Categories;

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    db.connectDb();
    const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();

    return {
        props: {
            categories: JSON.parse(JSON.stringify(categories)),
        },
    };
}
