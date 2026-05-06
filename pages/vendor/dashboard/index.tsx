import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorDashboardPage = ({ overview }: any) => {
    const metrics = overview?.metrics || {};

    return (
        <VendorLayout title="Vendor Overview">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Products</p><p className="text-2xl font-bold">{metrics.products || 0}</p></div>
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Offers</p><p className="text-2xl font-bold">{metrics.offers || 0}</p></div>
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Orders</p><p className="text-2xl font-bold">{metrics.orders || 0}</p></div>
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Gross Sales</p><p className="text-2xl font-bold">${Number(metrics.grossSales || 0).toFixed(2)}</p></div>
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Reviews</p><p className="text-2xl font-bold">{metrics.reviews || 0}</p></div>
                <div className="border rounded-lg p-4"><p className="text-sm text-slate-500">Comments</p><p className="text-2xl font-bold">{metrics.comments || 0}</p></div>
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorDashboardPage;
