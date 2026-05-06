import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    selectMenuSidebarDashboard,
    toggleSidebar,
} from "@/redux/slices/MenuSlice";
import {
    BuildingStorefrontIcon,
    ChartBarSquareIcon,
    ChevronRightIcon,
    Cog6ToothIcon,
    CubeIcon,
    FolderIcon,
    InboxStackIcon,
    QueueListIcon,
    Squares2X2Icon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const Sidebar = () => {
    const router = useRouter();
    const route = router.pathname.split("/admin/dashboard/")[1];
    const dispatch = useAppDispatch();
    const menuSidebar = useAppSelector(selectMenuSidebarDashboard);
    const { data: session } = useSession<any>();
    const profilePath = "/admin/dashboard/profile";

    const goToProfile = () => {
        if (router.asPath !== profilePath) {
            router.push(profilePath);
        }
    };

    const handleMenu = () => {
        dispatch(toggleSidebar());
    };

    const menuItems = [
        {
            key: "dashboard",
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: ChartBarSquareIcon,
            active: route === undefined,
        },
        {
            key: "vendors",
            href: "/admin/dashboard/vendors",
            label: "Vendors",
            icon: BuildingStorefrontIcon,
            active: route === "vendors",
        },
        {
            key: "categories",
            href: "/admin/dashboard/categories",
            label: "Categories",
            icon: FolderIcon,
            active: route === "categories",
        },
        {
            key: "sub-categories",
            href: "/admin/dashboard/sub-categories",
            label: "Sub Categories",
            icon: QueueListIcon,
            active: route === "sub-categories",
        },
        {
            key: "home-sections",
            href: "/admin/dashboard/home-sections",
            label: "Home Sections",
            icon: Squares2X2Icon,
            active: route === "home-sections",
        },
        {
            key: "settings",
            href: "/admin/dashboard/settings",
            label: "Ajustes",
            icon: Cog6ToothIcon,
            active: route === "settings",
        },
        {
            key: "users",
            href: "/admin/dashboard/users",
            label: "Users",
            icon: UsersIcon,
            active: route === "users",
        },
        {
            key: "store-requests",
            href: "/admin/dashboard/store-requests",
            label: "Store Requests",
            icon: InboxStackIcon,
            active: route === "store-requests",
        },
        {
            key: "products",
            href: "/admin/dashboard/product",
            label: "Products",
            icon: CubeIcon,
            active: Boolean(route?.startsWith("product")),
        },
    ];

    return (
        <>
            <div
                className={`relative hidden h-auto border-r border-vendora bg-vendora-surface md:block md:p-3 ${
                    menuSidebar ? "opened" : "w-[80px]"
                }`}
            >
                <div
                    className="absolute top-4 -right-6 rounded-r border border-l-0 border-vendora bg-vendora-surface py-2"
                    onClick={handleMenu}
                >
                    <ChevronRightIcon
                        className={`h-6 w-6 cursor-pointer ${menuSidebar && "rotate-180"}`}
                    />
                </div>
                <div className="fixed">
                    <div className="mt-4 flex items-center gap-2 px-2">
                        <button
                            type="button"
                            onClick={goToProfile}
                            className="relative h-10 w-10 overflow-hidden rounded-full border border-vendora hover:ring-2 hover:ring-vendora-accent-soft"
                            title="Mi Cuenta"
                        >
                            <Image
                                src={session?.user?.image || "https://i.stack.imgur.com/34AD2.jpg"}
                                alt="admin-logo"
                                fill
                                className="rounded-full object-cover"
                            />
                        </button>

                        <div className="show flex-col justify-center pl-3 text-sm">
                            <span className="font-semibold">Welcome back 👋</span>
                            <span className="text-slate-600">{session?.user?.name}</span>
                        </div>
                    </div>

                    <div className="mt-6 px-2">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.key}>
                                        <Link
                                            className={`flex items-center rounded p-2 transition duration-300 hover:bg-vendora-accent-soft ${
                                                item.active ? "bg-vendora-accent-soft" : ""
                                            }`}
                                            href={item.href}
                                        >
                                            <Icon className="h-6 w-6" />
                                            <span className="show pl-3 text-slate-600">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-vendora bg-vendora-surface/95 backdrop-blur md:hidden">
                <div className="flex items-center gap-1 overflow-x-auto px-2 py-2">
                    <button
                        type="button"
                        onClick={goToProfile}
                        className={`flex min-w-[72px] flex-col items-center rounded-md px-2 py-1 text-[11px] ${
                            route === "profile" ? "bg-vendora-accent-soft text-vendora-ink" : "text-slate-600"
                        }`}
                    >
                        <span className="relative h-7 w-7 overflow-hidden rounded-full border border-vendora">
                            <Image
                                src={session?.user?.image || "https://i.stack.imgur.com/34AD2.jpg"}
                                alt="admin-avatar"
                                fill
                                className="object-cover"
                            />
                        </span>
                        Cuenta
                    </button>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex min-w-[72px] flex-col items-center rounded-md px-2 py-1 text-[11px] ${
                                    item.active ? "bg-vendora-accent-soft text-vendora-ink" : "text-slate-600"
                                }`}
                            >
                                <Icon className="mb-1 h-5 w-5" />
                                <span className="text-center leading-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
