import { useState } from "react";
import axios from "axios";
import VendorLayout from "@/components/vendor/layout/Layout";
import User from "@/models/User";
import { requirePortalSession } from "@/utils/portalAuth";
import { uploadImages } from "@/request/upload";
import Image from "next/image";

const VendorProfilePage = ({ profile }: any) => {
    const [form, setForm] = useState({
        name: profile?.name || "",
        email: profile?.email || "",
        image: profile?.image || "",
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const saveProfile = async () => {
        try {
            setSaving(true);
            setMessage("");
            let image = form.image;

            if (avatarFile) {
                const formData = new FormData();
                formData.append("path", "profile avatars");
                formData.append("file", avatarFile);
                const uploaded = await uploadImages(formData);
                image = uploaded?.[0]?.url || image;
            }

            const { data } = await axios.put("/api/user/profile", {
                name: form.name,
                image,
            });
            setForm((prev) => ({ ...prev, image: data?.profile?.image || image }));
            setAvatarFile(null);
            setMessage(data.message || "Profile updated.");
        } catch (error: any) {
            setMessage(error?.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <VendorLayout title="Mi Cuenta">
            <div className="max-w-3xl space-y-4">
                <div className="bg-white border rounded-lg p-4 space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input value={form.email} disabled className="w-full border rounded-md px-3 py-2 bg-gray-50" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Avatar</label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-vendora">
                                <Image
                                    src={form.image || "https://i.stack.imgur.com/34AD2.jpg"}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Selecciona una imagen para actualizar tu avatar.</p>
                    </div>
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-vendora-accent text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
                    >
                        {saving ? "Guardando..." : "Guardar perfil"}
                    </button>
                    {message && <p className="text-sm text-slate-600">{message}</p>}
                </div>
            </div>
        </VendorLayout>
    );
};

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["vendor", "admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    const user = await User.findById(auth.session.user.id).lean();

    return {
        props: {
            profile: JSON.parse(JSON.stringify(user || null)),
        },
    };
}

export default VendorProfilePage;
