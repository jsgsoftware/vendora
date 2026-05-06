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
import SubCategory from "../../../models/SubCategory";
import { requirePortalSession } from "@/utils/portalAuth";

const SubCategories = ({ categories, subCategories }: any) => {
    const [data, setData] = useState(subCategories || []);
    const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
    const [name, setName] = useState("");
    const [parent, setParent] = useState("");
    const [showInStore, setShowInStore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState("");
    const [editingName, setEditingName] = useState("");
    const [editingParent, setEditingParent] = useState("");

    const categoryMap = useMemo(() => {
        const map = new Map();
        (categories || []).forEach((category: any) => {
            map.set(String(category._id), category.name);
        });
        return map;
    }, [categories]);

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

    const activeSubCategories = useMemo(
        () => sortedData.filter((sub: any) => (sub.status || "active") === "active"),
        [sortedData]
    );
    const inactiveSubCategories = useMemo(
        () => sortedData.filter((sub: any) => (sub.status || "active") !== "active"),
        [sortedData]
    );
    const visibleData = activeTab === "active" ? activeSubCategories : inactiveSubCategories;

    const createSubCategory = async (e: any) => {
        e.preventDefault();
        if (!name.trim() || !parent) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("/api/admin/subcategory", {
                name: name.trim(),
                parent,
                showInStore,
            });
            setData(response.data.subCategories || response.data.subCategory || []);
            setName("");
            setParent("");
            setShowInStore(true);
        } finally {
            setLoading(false);
        }
    };

    const updateSubCategory = async (id: string, payload: any) => {
        const response = await axios.put("/api/admin/subcategory", { id, ...payload });
        setData(response.data.subCategories || []);
    };

    return (
        <Layout>
            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-bold text-vendora-ink">Subcategory Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage subcategories, parent category, status and storefront visibility.</p>

                <form onSubmit={createSubCategory} className="mt-6 bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Subcategory name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-vendora rounded-md px-3 py-2"
                            placeholder="e.g. Laptops"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Parent category</label>
                        <select
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            className="w-full border border-vendora rounded-md px-3 py-2"
                        >
                            <option value="">Select category</option>
                            {categories.map((category: any) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 md:mb-2">
                        <input
                            type="checkbox"
                            checked={showInStore}
                            onChange={(e) => setShowInStore(e.target.checked)}
                        />
                        Show on storefront
                    </label>
                    <button disabled={loading} className="button-orange px-4 py-2 rounded-md md:mb-1">
                        {loading ? "Saving..." : "Add Subcategory"}
                    </button>
                </form>

                <div className="mt-6 bg-white border rounded-lg overflow-hidden">
                    <div className="px-4 pt-4">
                        <div className="inline-flex rounded-md border bg-gray-50 p-1">
                            <button
                                onClick={() => setActiveTab("active")}
                                className={`px-3 py-1.5 text-sm rounded-md ${activeTab === "active" ? "bg-vendora-accent text-white" : "text-gray-700"}`}
                            >
                                Active ({activeSubCategories.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("inactive")}
                                className={`px-3 py-1.5 text-sm rounded-md ${activeTab === "inactive" ? "bg-vendora-accent text-white" : "text-gray-700"}`}
                            >
                                Inactive ({inactiveSubCategories.length})
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
                        <div className="col-span-1">#</div>
                        <div className="col-span-2">Name</div>
                        <div className="col-span-3">Parent</div>
                        <div className="col-span-2">Slug</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Store</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {visibleData.map((sub: any, index: number) => {
                        const isEditing = editingId === sub._id;
                        const isActive = (sub.status || "active") === "active";
                        const visible = sub.showInStore !== false;

                        return (
                            <div key={sub._id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b last:border-b-0">
                                <div className="col-span-1 text-xs text-gray-500">{index + 1}</div>
                                <div className="col-span-2">
                                    {isEditing ? (
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="w-full border border-vendora rounded px-2 py-1"
                                        />
                                    ) : (
                                        <span className="font-medium text-vendora-ink">{sub.name}</span>
                                    )}
                                </div>
                                <div className="col-span-3 text-sm text-gray-700">
                                    {isEditing ? (
                                        <select
                                            value={editingParent}
                                            onChange={(e) => setEditingParent(e.target.value)}
                                            className="w-full border border-vendora rounded px-2 py-1"
                                        >
                                            {categories.map((category: any) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        categoryMap.get(String(sub.parent)) || "-"
                                    )}
                                </div>
                                <div className="col-span-2 text-sm text-gray-600">{sub.slug}</div>
                                <div className="col-span-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="col-span-1">
                                    <button
                                        onClick={() => updateSubCategory(sub._id, { showInStore: !visible })}
                                        className="text-gray-700 hover:text-vendora-accent"
                                    >
                                        {visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="col-span-1 flex justify-end gap-2">
                                    {activeTab === "active" && (
                                        <>
                                            <button
                                                onClick={() => updateSubCategory(sub._id, { action: "move", direction: "up" })}
                                                className="text-gray-600 hover:text-vendora-accent"
                                                title="Move up"
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => updateSubCategory(sub._id, { action: "move", direction: "down" })}
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
                                                updateSubCategory(sub._id, {
                                                    name: editingName.trim() || sub.name,
                                                    parent: editingParent || sub.parent,
                                                });
                                                setEditingId("");
                                                setEditingName("");
                                                setEditingParent("");
                                            }}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(sub._id);
                                                setEditingName(sub.name);
                                                setEditingParent(sub.parent || "");
                                            }}
                                            className="text-slate-600 hover:text-vendora-accent"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => updateSubCategory(sub._id, { status: isActive ? "inactive" : "active" })}
                                        className={isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
                                    >
                                        <NoSymbolIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {!visibleData.length && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">No subcategories in this tab.</div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SubCategories;

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    db.connectDb();
    const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();
    const subCategories = await SubCategory.find({}).sort({ updatedAt: -1 }).lean();

    return {
        props: {
            categories: JSON.parse(JSON.stringify(categories)),
            subCategories: JSON.parse(JSON.stringify(subCategories)),
        },
    };
}
