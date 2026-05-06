import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import User from "@/models/User";

const VendorRequestPage = ({ existingRequest }: any) => {
    const [form, setForm] = useState({
        storeName: existingRequest?.storeName || "",
        niche: existingRequest?.niche || "",
        products: existingRequest?.products || "",
        experience: existingRequest?.experience || "",
        businessType: existingRequest?.businessType || "",
        socialLinks: existingRequest?.socialLinks || "",
        notes: existingRequest?.notes || "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(existingRequest?.status || "none");

    const submitRequest = async (e: any) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage("");
            const { data } = await axios.post("/api/vendor/request", form);
            setMessage(data.message || "Request submitted.");
            setStatus("pending");
        } catch (error: any) {
            setMessage(error?.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="Request Vendor Store" />
            <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
                <h1 className="text-2xl font-bold text-vendora-ink">Request to Open a Store</h1>
                <p className="text-sm text-gray-600">Tell the admin what you plan to sell and your store niche.</p>

                {status !== "none" && (
                    <div className={`text-sm px-3 py-2 rounded-md ${status === "pending" ? "bg-yellow-100 text-yellow-700" : status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        Current status: {status}
                    </div>
                )}

                <form onSubmit={submitRequest} className="bg-white border rounded-lg p-4 space-y-3">
                    <input className="w-full border rounded-md px-3 py-2" placeholder="Store name" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                    <input className="w-full border rounded-md px-3 py-2" placeholder="Niche (e.g. beauty, gadgets, handmade)" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                    <textarea className="w-full border rounded-md px-3 py-2" rows={3} placeholder="What products will you sell?" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} />
                    <textarea className="w-full border rounded-md px-3 py-2" rows={2} placeholder="Selling experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                    <input className="w-full border rounded-md px-3 py-2" placeholder="Business type (individual/company)" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} />
                    <input className="w-full border rounded-md px-3 py-2" placeholder="Social links / website" value={form.socialLinks} onChange={(e) => setForm({ ...form, socialLinks: e.target.value })} />
                    <textarea className="w-full border rounded-md px-3 py-2" rows={2} placeholder="Extra notes for admin" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    <button disabled={loading || status === "pending"} className="button-orange px-4 py-2 rounded-md">
                        {loading ? "Submitting..." : status === "pending" ? "Request Pending" : "Submit Request"}
                    </button>
                </form>
                {message && <p className="text-sm text-slate-600">{message}</p>}
            </main>
            <Footer />
        </>
    );
};

export async function getServerSideProps(context: any) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin?callbackUrl=/vendor/request",
                permanent: false,
            },
        };
    }

    return {
        props: {
            existingRequest: (await User.findById(session.user.id).lean())?.vendorRequest || null,
        },
    };
}

export default VendorRequestPage;
