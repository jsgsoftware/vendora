import nc from "next-connect";
import auth from "../../../middleware/auth";
import User from "../../../models/User";
import { ensureVendorForUser } from "../../../utils/vendorData";

const handler = nc().use(auth);

handler.post(async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const membership = await ensureVendorForUser({
            userId: user._id,
            email: user.email,
            name: user.name,
            storeName: req.body?.storeName,
        });

        await user.updateOne({ role: "vendor" });

        return res.status(200).json({
            message: "Vendor profile created.",
            vendorId: membership?.vendor_id,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default handler;
