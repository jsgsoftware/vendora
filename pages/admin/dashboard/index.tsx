import Layout from "@/components/admin/layout/Layout";
import { requirePortalSession } from "@/utils/portalAuth";
import { getAdminOverview } from "@/utils/vendorData";
import Link from "next/link";
import { useRouter } from "next/router";

const Dashboard = ({ metrics, vendors, selectedVendor }: any) => {
    const router = useRouter();

    return ( 
        <Layout>
            <div className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-600">Tenant / Vendor:</label>
                    <select
                        value={selectedVendor || ""}
                        onChange={(e) => {
                            const vendor = e.target.value;
                            router.push(vendor ? `/admin/dashboard?vendor=${vendor}` : "/admin/dashboard");
                        }}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="">All vendors</option>
                        {vendors.map((vendor: any) => (
                            <option value={vendor.id} key={vendor.id}>
                                {vendor.display_name}
                            </option>
                        ))}
                    </select>
                    <Link href="/admin/dashboard/vendors" className="text-sm text-blue-600 hover:underline">
                        Manage vendors
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Vendors</p><p className="text-2xl font-bold">{metrics.vendors}</p></div>
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Stores</p><p className="text-2xl font-bold">{metrics.stores}</p></div>
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Products</p><p className="text-2xl font-bold">{metrics.products}</p></div>
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Offers</p><p className="text-2xl font-bold">{metrics.offers}</p></div>
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Orders</p><p className="text-2xl font-bold">{metrics.orders}</p></div>
                    <div className="border rounded p-4"><p className="text-sm text-slate-500">Gross Sales</p><p className="text-2xl font-bold">${Number(metrics.grossSales || 0).toFixed(2)}</p></div>
                </div>
            </div>
        </Layout>
    );
}
 
export default Dashboard;

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    const selectedVendor = context.query.vendor || null;
    const { vendors, metrics } = await getAdminOverview(selectedVendor);

    return {
        props: {
            vendors: JSON.parse(JSON.stringify(vendors)),
            metrics,
            selectedVendor,
        },
    };
}

