import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeMenu, selectMenu } from "@/redux/slices/MenuSlice";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useI18n } from "@/context/i18n";
import { useEffect, useState } from "react";

type SidebarCategory = {
    id: string;
    name: string;
    slug: string;
    children?: SidebarCategory[];
};

const MenuSideBar = () => {
    const dispatch = useAppDispatch();
    const menu = useAppSelector(selectMenu);
    const { t } = useI18n();
    const [categories, setCategories] = useState<SidebarCategory[]>([]);
    const [showAllDepartments, setShowAllDepartments] = useState(false);
    const [activeParentCategory, setActiveParentCategory] = useState<SidebarCategory | null>(null);

    const categoryTranslationBySlug: Record<string, string> = {
        electronics: "electronics",
        computers: "computers",
        "smart-home": "smartHome",
        "arts-crafts": "artsCrafts",
    };

    const translateCategoryName = (category: SidebarCategory) => {
        const key = categoryTranslationBySlug[String(category.slug || "").toLowerCase()];
        if (key === "electronics") return t("electronics");
        if (key === "computers") return t("computers");
        if (key === "smartHome") return t("smartHome");
        if (key === "artsCrafts") return t("artsCrafts");
        return category.name;
    };

    const visibleCategories = showAllDepartments ? categories : categories.slice(0, 4);

    const handleCategoryClick = (category: SidebarCategory) => {
        if (Array.isArray(category.children) && category.children.length > 0) {
            setActiveParentCategory(category);
            return;
        }
        dispatch(closeMenu());
        window.location.href = `/browse?category=${encodeURIComponent(String(category.id))}`;
    };

    const handleSubCategoryClick = (subCategory: SidebarCategory) => {
        dispatch(closeMenu());
        window.location.href = `/browse?search=${encodeURIComponent(String(subCategory.name || ""))}`;
    };

    useEffect(() => {
        let mounted = true;

        async function loadCategories() {
            try {
                const response = await fetch("/api/categories");
                const data = await response.json();
                if (mounted) {
                    setCategories(Array.isArray(data.categories) ? data.categories : []);
                }
            } catch {
                if (mounted) {
                    setCategories([]);
                }
            }
        }

        loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <>
            <div
                className={`flex flex-col fixed bg-white shadow-xl w-72 md:w-96 h-screen top-0 z-50 
               ${menu ? "block" : "hidden"}
            `}
            >
                <div className="relative">
                    <div
                        className="absolute top-3 cursor-pointer -right-12 hover:scale-110 transition"
                        onClick={() => dispatch(closeMenu())}
                    >
                        <XMarkIcon className="h-9 text-white drop-shadow-md" />
                    </div>

                    <div className="flex items-center bg-gradient-to-r from-[#7B2FF7] to-[#B06CFF] text-white px-8 py-3 ">
                        <UserCircleIcon className="h-9" />
                        <b className="text-xl font-bold ml-3">{t("hello")}, {t("signIn")}</b>
                    </div>

                    <div className="menu-sidebar menu-sidebar-scroll flex flex-col py-2 overflow-y-auto h-[calc(100vh-68px)]">

                        {activeParentCategory && (
                            <div className="border-b pb-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveParentCategory(null)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    MAIN MENU
                                </button>
                            </div>
                        )}

                        {!activeParentCategory && (
                            <>
                                <h3>
                                    {t("digitalContent")}
                                </h3>
                                <ul className="border-b pb-2">
                                    <li className="group">
                                        {t("primeVideo")}
                                        <ChevronRightIcon className="group-hover:text-gray-800"  />
                                    </li>
                                    <li className="group">
                                        {t("vendoraMusic")}
                                        <ChevronRightIcon className="group-hover:text-gray-800"  />
                                    </li>
                                    <li className="group">
                                        {t("kindleBooks")}
                                        <ChevronRightIcon className="group-hover:text-gray-800"  />
                                    </li>
                                    <li className="group">
                                        {t("vendoraAppstore")}
                                        <ChevronRightIcon className="group-hover:text-gray-800" />
                                    </li>
                                </ul>
                            </>
                        )}

                        {!activeParentCategory && (
                            <>
                                <h3>
                                    {t("shopByDepartment")}
                                </h3>
                                <ul className="border-b pb-2">
                                    {visibleCategories.map((category) => (
                                        <li
                                            key={category.id}
                                            className="group"
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            {translateCategoryName(category)}
                                            <ChevronRightIcon className="group-hover:text-gray-800" />
                                        </li>
                                    ))}
                                    {!categories.length && (
                                        <li className="group">
                                            {t("electronics")}
                                            <ChevronRightIcon className="group-hover:text-gray-800" />
                                        </li>
                                    )}
                                    {categories.length > 4 && (
                                        <li
                                            className="group"
                                            onClick={() => setShowAllDepartments((prev) => !prev)}
                                        >
                                            {showAllDepartments ? t("seeLess") : t("seeAll")}
                                            {showAllDepartments ? (
                                                <ChevronUpIcon className="group-hover:text-gray-800" />
                                            ) : (
                                                <ChevronDownIcon className="group-hover:text-gray-800" />
                                            )}
                                        </li>
                                    )}
                                </ul>

                                <h3>
                                    {t("programs")}
                                </h3>
                                <ul className="border-b pb-2">
                                    <li className="group">
                                        {t("giftCards")}
                                        <ChevronRightIcon className="group-hover:text-gray-800" />
                                    </li>
                                    <li className="group">
                                        {t("shopByInterest")}
                                        <ChevronRightIcon className="group-hover:text-gray-800" />
                                    </li>
                                    <li className="group">
                                        {t("vendoraLive")}
                                        <ChevronRightIcon className="group-hover:text-gray-800" />
                                    </li>
                                </ul>
                            </>
                        )}

                        {activeParentCategory && (
                            <>
                                <h3>{translateCategoryName(activeParentCategory)}</h3>
                                <ul className="border-b pb-2">
                                    {(activeParentCategory.children || []).map((child) => (
                                        <li
                                            key={child.id}
                                            className="group"
                                            onClick={() => handleSubCategoryClick(child)}
                                        >
                                            {translateCategoryName(child)}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {menu && (
                <div
                    onClick={() => dispatch(closeMenu())}
                    className="fixed bg-zinc-900/[0.85] w-full  h-screen z-40 top-0 right-0"
                ></div>
            )}
        </>
    );
};

export default MenuSideBar;
