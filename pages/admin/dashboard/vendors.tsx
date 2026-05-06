import Layout from "@/components/admin/layout/Layout";
import { requirePortalSession } from "@/utils/portalAuth";
import { getAdminOverview } from "@/utils/vendorData";
import Link from "next/link";

const VendorsPage = ({ vendors }: any) => {
    return (
        <Layout>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Vendors</h2>
                <div className="overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-left">Store</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Verification</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((vendor: any) => (
                                <tr className="border-t" key={vendor.id}>
                                    <td className="p-3">{vendor.display_name}</td>
                                    <td className="p-3">{vendor.email}</td>
                                    <td className="p-3">{vendor.status}</td>
                                    <td className="p-3">{vendor.verification_status}</td>
                                    <td className="p-3">
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/admin/dashboard?vendor=${vendor.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View tenant
                                            </Link>
                                            <Link
                                                href={`/vendor/dashboard?vendor=${vendor.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Open vendor panel
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    const { vendors } = await getAdminOverview(null);

    return {
        props: {
            vendors: JSON.parse(JSON.stringify(vendors)),
        },
    };
}

export default VendorsPage;
