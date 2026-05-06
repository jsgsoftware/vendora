import nc from "next-connect";
import db from "../../../utils/db";
import { validateEmail } from "../../../utils/validation";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import { createActivationToken } from "../../../utils/tokens";
import { sendEmail } from "../../../utils/sendEmails";
import { activateEmailTemplate } from "../../../emails/activateEmailTemplate";

const handler = nc();

handler.post(async (req, res) => {
    try {
        await db.connectDb();
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Please fill in all fields." });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "invalid email." });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res
                .status(400)
                .json({ message: "this email already exits." });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "password must be at least 6 characters." });
        }
        const cryptedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            name,
            email,
            password: cryptedPassword,
            role: "user",
            image: "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
            emailVerified: false,
            defaultPaymentMethod: "",
            address: [],
            whishlist: [],
        });
        const addedUser = await newUser.save();

        const canSendActivationEmail =
            !!process.env.ACTIVATION_TOKEN_SECRET &&
            !!process.env.BASE_URL &&
            !!process.env.MAILING_SERVICE_CLIENT_ID &&
            !!process.env.MAILING_SERVICE_CLIENT_SECRET &&
            !!process.env.MAILING_SERVICE_REFRESH_TOKEN &&
            !!process.env.SENDER_EMAIL_ADDRESS;

        let message = "Register success!";

        if (canSendActivationEmail) {
            try {
                const activation_token = createActivationToken({
                    id: addedUser._id.toString(),
                });
                const url = `${process.env.BASE_URL}/activate/${activation_token}`;
                sendEmail(email, url, "", "Activate your account", activateEmailTemplate);
                message = "Register success! Please check your email to activate your account.";
            } catch (_error) {
                message = "Register success! Activation email is currently unavailable.";
            }
        }

        await db.disconnectDb();
        res.json({ message })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default handler;
