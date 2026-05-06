import { getSession } from "next-auth/react";

const AdminEntry = () => null;

export async function getServerSideProps(context: any) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin?callbackUrl=/admin/dashboard",
                permanent: false,
            },
        };
    }

    return {
        redirect: {
            destination: "/admin/dashboard",
            permanent: false,
        },
    };
}

export default AdminEntry;
