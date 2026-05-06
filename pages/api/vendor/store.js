import nc from "next-connect";
import auth from "../../../middleware/auth";
import User from "../../../models/User";
import {
    ensureVendorForUser,
    getVendorMembership,
    getVendorStore,
    upsertVendorStore,
} from "../../../utils/vendorData";

const handler = nc().use(auth);

handler.get(async (req, res) => {
    try {
        const membership = await getVendorMembership(req.user);
        if (!membership) {
            return res.status(200).json({ store: null, vendorId: null });
        }

        const store = await getVendorStore(membership.vendor_id);

        return res.status(200).json({
            vendorId: membership.vendor_id,
            store,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

handler.put(async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let membership = await getVendorMembership(req.user);

        if (!membership) {
            membership = await ensureVendorForUser({
                userId: user._id,
                email: user.email,
                name: user.name,
                storeName: req.body?.name,
            });
            await user.updateOne({ role: "vendor" });
        }

        const store = await upsertVendorStore(membership.vendor_id, req.body || {});

        return res.status(200).json({
            message: "Store updated successfully.",
            vendorId: membership.vendor_id,
            store,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default handler;
