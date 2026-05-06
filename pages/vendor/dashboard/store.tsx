import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";
import { useState } from "react";
import axios from "axios";

const VendorStorePage = ({ overview }: any) => {
    const store = overview?.store || {};
    const [form, setForm] = useState({
        name: store.name || "",
        slug: store.slug || "",
        description: store.description || "",
        logo_url: store.logo_url || "",
        banner_url: store.banner_url || "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveStore = async () => {
        try {
            setLoading(true);
            const { data } = await axios.put("/api/vendor/store", form);
            setMessage(data.message || "Store saved");
        } catch (error: any) {
            setMessage(error?.response?.data?.message || "Failed saving store");
        } finally {
            setLoading(false);
        }
    };

    return (
        <VendorLayout title="Store Settings">
            <div className="grid md:grid-cols-2 gap-4">
                <input name="name" value={form.name} onChange={onChange} className="border rounded px-3 py-2" placeholder="Store name" />
                <input name="slug" value={form.slug} onChange={onChange} className="border rounded px-3 py-2" placeholder="Store slug" />
                <input name="logo_url" value={form.logo_url} onChange={onChange} className="border rounded px-3 py-2" placeholder="Logo URL" />
                <input name="banner_url" value={form.banner_url} onChange={onChange} className="border rounded px-3 py-2" placeholder="Banner URL" />
                <textarea name="description" value={form.description} onChange={onChange} className="border rounded px-3 py-2 md:col-span-2" placeholder="Store description" rows={4} />
            </div>
            <div className="mt-4 flex items-center gap-3">
                <button onClick={saveStore} disabled={loading} className="px-5 py-2 text-sm rounded-md bg-vendora-accent text-white hover:opacity-90 disabled:opacity-60">
                    {loading ? "Saving..." : "Save Store"}
                </button>
                {message && <span className="text-sm text-slate-600">{message}</span>}
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorStorePage;
