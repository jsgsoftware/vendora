import { getSession } from "next-auth/react";

const VendorEntry = () => null;

export async function getServerSideProps(context: any) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin?callbackUrl=/vendor/dashboard",
                permanent: false,
            },
        };
    }

    return {
        redirect: {
            destination: "/vendor/dashboard",
            permanent: false,
        },
    };
}

export default VendorEntry;
