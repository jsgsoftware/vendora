import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorCommentsPage = ({ overview }: any) => {
    const comments = overview?.comments || [];

    return (
        <VendorLayout title="Order Comments">
            <div className="space-y-3">
                {comments.map((comment: any) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                        <p className="text-sm text-slate-500">Order: {comment.order_id}</p>
                        <p className="text-sm text-slate-500">By: {comment.author_name || comment.author_type}</p>
                        <p className="mt-2">{comment.comment}</p>
                    </div>
                ))}
                {!comments.length && <p className="text-slate-500">No comments yet.</p>}
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorCommentsPage;
