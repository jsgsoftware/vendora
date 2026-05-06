import nc from "next-connect";
import auth from "../../../middleware/auth";
import User from "../../../models/User";

const handler = nc().use(auth);

handler.get(async (req, res) => {
    try {
        const user = await User.findById(req.user).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ request: user.vendorRequest || null });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch request" });
    }
});

handler.post(async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "vendor" || user.role === "admin") {
            return res.status(400).json({ message: "Your account already has seller access." });
        }

        const currentRequest = user.vendorRequest || null;
        if (currentRequest?.status === "pending") {
            return res.status(400).json({ message: "You already have a pending request." });
        }

        const payload = {
            storeName: String(req.body?.storeName || "").trim(),
            niche: String(req.body?.niche || "").trim(),
            products: String(req.body?.products || "").trim(),
            experience: String(req.body?.experience || "").trim(),
            businessType: String(req.body?.businessType || "").trim(),
            socialLinks: String(req.body?.socialLinks || "").trim(),
            notes: String(req.body?.notes || "").trim(),
        };

        if (!payload.storeName || !payload.niche || !payload.products) {
            return res.status(400).json({ message: "Store name, niche and products are required." });
        }

        const requestData = {
            ...payload,
            status: "pending",
            submittedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewNotes: "",
        };

        await user.updateOne({ vendorRequest: requestData });

        return res.status(200).json({
            message: "Your store request was submitted successfully.",
            request: requestData,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to submit request" });
    }
});

export default handler;
