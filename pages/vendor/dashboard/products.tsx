import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorProductsPage = ({ overview }: any) => {
    const rows = overview?.vendorProducts || [];

    return (
        <VendorLayout title="Vendor Products">
            <div className="overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Slug</th>
                            <th className="text-left p-3">Brand</th>
                            <th className="text-left p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((p: any) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-3">{p.name}</td>
                                <td className="p-3">{p.slug}</td>
                                <td className="p-3">{p.brand || "-"}</td>
                                <td className="p-3">{p.status || "active"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorProductsPage;
