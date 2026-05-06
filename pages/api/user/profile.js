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

        return res.status(200).json({
            profile: {
                id: user._id,
                name: user.name || "",
                email: user.email || "",
                image: user.image || "",
                role: user.role || "user",
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to load profile" });
    }
});

handler.put(async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const name = String(req.body?.name || "").trim();
        const image = String(req.body?.image || "").trim();

        if (!name) {
            return res.status(400).json({ message: "Name is required." });
        }

        user.name = name;
        user.image = image || user.image || "";
        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            profile: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image || "",
                role: user.role || "user",
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to update profile" });
    }
});

export default handler;
