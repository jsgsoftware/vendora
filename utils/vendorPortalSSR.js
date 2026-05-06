import { requirePortalSession } from "./portalAuth";
import { ensureVendorForUser, getVendorMembership, getVendorOverview } from "./vendorData";

export async function getVendorPageProps(context) {
    const auth = await requirePortalSession(context, ["vendor", "admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    const session = auth.session;
    let membership = await getVendorMembership(session.user.id);

    if (!membership && session.user.role === "vendor") {
        membership = await ensureVendorForUser({
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            storeName: `${session.user.name || "Vendor"} Store`,
        });
    }

    if (!membership && session.user.role !== "admin") {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const vendorId =
        session.user.role === "admin"
            ? context.query.vendor || membership?.vendor_id || null
            : membership?.vendor_id;

    if (!vendorId) {
        return {
            props: {
                session,
                overview: null,
                vendorId: null,
            },
        };
    }

    const overview = await getVendorOverview(vendorId);

    return {
        props: {
            session,
            overview: JSON.parse(JSON.stringify(overview)),
            vendorId,
        },
    };
}
