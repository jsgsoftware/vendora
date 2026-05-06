import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorSalesPage = ({ overview }: any) => {
    const items = overview?.orderItems || [];

    return (
        <VendorLayout title="Vendor Sales">
            <div className="overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="text-left p-3">Order</th>
                            <th className="text-left p-3">Product</th>
                            <th className="text-left p-3">Qty</th>
                            <th className="text-left p-3">Price</th>
                            <th className="text-left p-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">{item.order_id}</td>
                                <td className="p-3">{item.name || item.product_id}</td>
                                <td className="p-3">{item.qty_ordered}</td>
                                <td className="p-3">${Number(item.price || 0).toFixed(2)}</td>
                                <td className="p-3">${Number(item.total || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorSalesPage;
