import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
    { href: "/vendor/dashboard", label: "Overview" },
    { href: "/vendor/dashboard/store", label: "Store" },
    { href: "/vendor/dashboard/products", label: "Products" },
    { href: "/vendor/dashboard/sales", label: "Sales" },
    { href: "/vendor/dashboard/reviews", label: "Reviews" },
    { href: "/vendor/dashboard/comments", label: "Comments" },
    { href: "/vendor/dashboard/settings", label: "Ajustes" },
];

const Sidebar = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const vendorQuery = router.query.vendor ? `?vendor=${router.query.vendor}` : "";
    const profilePath = `/vendor/dashboard/profile${vendorQuery}`;

    const goToProfile = () => {
        if (router.asPath !== profilePath) {
            router.push(profilePath);
        }
    };

    return (
        <aside className="bg-vendora-surface border border-vendora rounded-xl p-4 h-fit sticky top-4">
            <div className="pb-4 border-b">
                <button
                    type="button"
                    onClick={goToProfile}
                    className="mb-3 relative h-12 w-12 overflow-hidden rounded-full border border-vendora hover:ring-2 hover:ring-vendora-accent-soft"
                    title="Mi Cuenta"
                >
                    <Image
                        src={session?.user?.image || "https://i.stack.imgur.com/34AD2.jpg"}
                        alt="Vendor avatar"
                        fill
                        className="object-cover"
                    />
                </button>
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="font-semibold text-vendora-ink">{session?.user?.name || "Vendor"}</p>
            </div>

            <ul className="mt-4 space-y-2">
                {links.map((link) => {
                    const active = router.pathname === link.href;
                    const href = `${link.href}${vendorQuery}`;

                    return (
                        <li key={link.href}>
                            <Link
                                href={href}
                                className={`block rounded px-3 py-2 transition ${
                                    active
                                        ? "bg-vendora-accent text-white"
                                        : "hover:bg-vendora-accent-soft text-vendora-ink"
                                }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;
