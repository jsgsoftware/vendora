import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";

const auth = async (req, res, next) => {
    const session = await getSession({ req });
    if (session?.user?.id) {
        req.user = session.user.id;
        return next();
    }

    const token = await getToken({
        req,
        secret: process.env.JWT_SECRET,
        secureCookie: false,
    });

    if (token?.sub) {
        req.user = token.sub;
        return next();
    }

    return res.status(401).json({ message: "Not signed in:" });
};

export default auth;
