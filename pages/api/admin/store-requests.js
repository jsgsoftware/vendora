import nc from "next-connect";
import auth from "../../../middleware/auth";
import User from "../../../models/User";
import { ensureVendorForUser } from "@/utils/vendorData";

const handler = nc().use(auth);

async function ensureAdmin(req, res) {
    const adminUser = await User.findById(req.user);
    if (!adminUser || adminUser.role !== "admin") {
        res.status(403).json({ message: "Admin access required." });
        return null;
    }
    return adminUser;
}

handler.get(async (req, res) => {
    try {
        const admin = await ensureAdmin(req, res);
        if (!admin) return;

        const users = await User.find({}).lean();
        const requests = users
            .filter((u) => u.vendorRequest)
            .map((u) => ({
                userId: u._id,
                userName: u.name,
                userEmail: u.email,
                userRole: u.role || "user",
                ...u.vendorRequest,
            }))
            .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());

        return res.status(200).json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch store requests" });
    }
});

handler.put(async (req, res) => {
    try {
        const admin = await ensureAdmin(req, res);
        if (!admin) return;

        const userId = req.body?.userId;
        const action = req.body?.action;
        const reviewNotes = String(req.body?.reviewNotes || "").trim();

        if (!userId || !["approve", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action or user id." });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const request = targetUser.vendorRequest;
        if (!request) {
            return res.status(400).json({ message: "No store request found for this user." });
        }

        if (action === "approve") {
            const membership = await ensureVendorForUser({
                userId: targetUser._id,
                email: targetUser.email,
                name: targetUser.name,
                storeName: request.storeName || `${targetUser.name || "Seller"} Store`,
            });

            await targetUser.updateOne({
                role: "vendor",
                vendorRequest: {
                    ...request,
                    status: "approved",
                    reviewedAt: new Date().toISOString(),
                    reviewNotes,
                    vendorId: membership?.vendor_id || null,
                },
            });
        }

        if (action === "reject") {
            await targetUser.updateOne({
                vendorRequest: {
                    ...request,
                    status: "rejected",
                    reviewedAt: new Date().toISOString(),
                    reviewNotes,
                },
            });
        }

        return res.status(200).json({ message: `Request ${action}d successfully.` });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to update request" });
    }
});

export default handler;
