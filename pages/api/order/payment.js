import nc from "next-connect";
import db from "../../../utils/db";
import Order from "../../../models/Order";
import auth from "../../../middleware/auth";
import { markOrderPaidInMv } from "../../../utils/mvSync";

const handler = nc().use(auth);

handler.put(async (req, res) => {
    try {
        db.connectDb;
        const {id} = req.body;

        const result = await Order.findOneAndUpdate(
            { _id: id},
            { isPaid: true },
            { new: true }
        );
        await markOrderPaidInMv(id);
        db.disconnectDb();
            // console.log('res api > ', result)
        return res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default handler;
