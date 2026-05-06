import { getSession } from "next-auth/react";

export async function requirePortalSession(context, allowedRoles = []) {
    const session = await getSession({ req: context?.req });

    if (!session) {
        return {
            ok: false,
            redirect: {
                redirect: {
                    destination: `/auth/signin?callbackUrl=${encodeURIComponent(context?.resolvedUrl || "/")}`,
                    permanent: false,
                },
            },
        };
    }

    const role = session?.user?.role || "user";
    if (allowedRoles.length && !allowedRoles.includes(role)) {
        return {
            ok: false,
            redirect: {
                redirect: {
                    destination: "/",
                    permanent: false,
                },
            },
        };
    }

    return {
        ok: true,
        session,
    };
}
