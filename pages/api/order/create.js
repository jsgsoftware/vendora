import nc from "next-connect";
import db from "../../../utils/db";
import User from "../../../models/User";
import Order from "../../../models/Order";
import auth from "../../../middleware/auth";
import { syncOrderToMv } from "../../../utils/mvSync";

const handler = nc().use(auth);

handler.post(async (req, res) => {
    try {
        db.connectDb;
        const {
            products,
            shippingAddress,
            paymentMethod,
            total,
            totalBeforeDiscount,
            couponApplied,
        } = req.body;
        const user = await User.findById(req.user);
        const newOrder = await new Order({
            user: user._id,
            products,
            shippingAddress,
            paymentMethod,
            total,
            totalBeforeDiscount,
            couponApplied,
        }).save();

        await syncOrderToMv({
            orderId: newOrder._id,
            userId: user._id,
            products,
            shippingAddress,
            paymentMethod,
            total,
            couponApplied,
        });
        db.disconnectDb();

        return res.json({ order_id: newOrder._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default handler;
