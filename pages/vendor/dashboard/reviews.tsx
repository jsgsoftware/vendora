import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorReviewsPage = ({ overview }: any) => {
    const reviews = overview?.vendorReviews || [];

    return (
        <VendorLayout title="Vendor Reviews">
            <div className="space-y-3">
                {reviews.map((review: any, index: number) => (
                    <div key={`${review.productId}-${index}`} className="border rounded-lg p-4">
                        <p className="font-semibold">{review.productName}</p>
                        <p className="text-sm text-slate-500">Rating: {review.rating || 0}</p>
                        <p className="mt-2">{review.review || "No text"}</p>
                    </div>
                ))}
                {!reviews.length && <p className="text-slate-500">No reviews yet.</p>}
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorReviewsPage;
