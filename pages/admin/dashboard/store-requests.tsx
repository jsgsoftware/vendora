import { useState } from "react";
import axios from "axios";
import Layout from "@/components/admin/layout/Layout";
import User from "@/models/User";
import { requirePortalSession } from "@/utils/portalAuth";

const StoreRequestsPage = ({ initialRequests }: any) => {
    const [requests, setRequests] = useState(initialRequests || []);
    const [notesByUser, setNotesByUser] = useState<Record<string, string>>({});
    const [busyUser, setBusyUser] = useState("");
    const [message, setMessage] = useState("");

    const updateRequest = async (userId: string, action: "approve" | "reject") => {
        try {
            setBusyUser(userId);
            setMessage("");
            await axios.put("/api/admin/store-requests", {
                userId,
                action,
                reviewNotes: notesByUser[userId] || "",
            });
            setRequests((prev: any[]) =>
                prev.map((request) =>
                    request.userId === userId
                        ? {
                              ...request,
                              status: action === "approve" ? "approved" : "rejected",
                              reviewedAt: new Date().toISOString(),
                              reviewNotes: notesByUser[userId] || "",
                          }
                        : request
                )
            );
            setMessage(`Request ${action}d.`);
        } catch (error: any) {
            setMessage(error?.response?.data?.message || "Failed to update request.");
        } finally {
            setBusyUser("");
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-4">
                <h1 className="text-2xl font-bold text-vendora-ink">Store Requests</h1>
                <p className="text-sm text-gray-600">Review seller applications from normal users.</p>
                {message && <div className="text-sm text-slate-700">{message}</div>}

                <div className="space-y-4">
                    {requests.length === 0 && (
                        <div className="border rounded-md bg-white p-4 text-sm text-gray-600">No store requests yet.</div>
                    )}

                    {requests.map((request: any) => (
                        <div key={request.userId} className="border rounded-md bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-vendora-ink">{request.storeName || "Store request"}</h3>
                                    <p className="text-xs text-gray-500">{request.userName} - {request.userEmail}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${request.status === "pending" ? "bg-yellow-100 text-yellow-700" : request.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {request.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <p><b>Niche:</b> {request.niche || "-"}</p>
                                <p><b>Products:</b> {request.products || "-"}</p>
                                <p><b>Business type:</b> {request.businessType || "-"}</p>
                                <p><b>Experience:</b> {request.experience || "-"}</p>
                                <p className="md:col-span-2"><b>Social links:</b> {request.socialLinks || "-"}</p>
                                <p className="md:col-span-2"><b>Notes:</b> {request.notes || "-"}</p>
                            </div>

                            <textarea
                                rows={2}
                                value={notesByUser[request.userId] || ""}
                                onChange={(e) => setNotesByUser((prev) => ({ ...prev, [request.userId]: e.target.value }))}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                placeholder="Admin review notes..."
                                disabled={request.status !== "pending"}
                            />

                            {request.status === "pending" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateRequest(request.userId, "approve")}
                                        disabled={busyUser === request.userId}
                                        className="px-3 py-2 rounded-md bg-green-600 text-white text-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateRequest(request.userId, "reject")}
                                        disabled={busyUser === request.userId}
                                        className="px-3 py-2 rounded-md bg-red-600 text-white text-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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

    const users = await User.find({}).lean();
    const requests = users
        .filter((u) => u.vendorRequest)
        .map((u) => ({
            userId: u._id,
            userName: u.name,
            userEmail: u.email,
            ...u.vendorRequest,
        }))
        .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());

    return {
        props: {
            initialRequests: JSON.parse(JSON.stringify(requests)),
        },
    };
}

export default StoreRequestsPage;
