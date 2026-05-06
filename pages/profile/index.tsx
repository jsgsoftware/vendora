import Layout from "@/components/profile/layout/Layout";
import db from "@/utils/db";
import { getSession } from "next-auth/react";
import { useState } from "react";
import Router from "next/router";

const Profile = ({ user, tab, orders }: any) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const requestVendorAccess = async () => {
        setLoading(true);
        Router.push("/vendor/request");
    };

    return (
        <>
            <Layout user={user} tab={tab} title={`${user.name}'s Profile`}>
            <div className="text-center">
                    <h2 className="text-4xl font-bold mb-6">My Profile</h2>
                    <div className="flex items-center justify-center gap-3">
                        {user?.role === "user" && (
                            <button
                                onClick={requestVendorAccess}
                                disabled={loading}
                                className="button-orange px-4 py-2 text-sm"
                            >
                                {loading ? "Opening..." : "Request Vendor Store"}
                            </button>
                        )}

                        {user?.role === "vendor" && (
                            <button
                                onClick={() => Router.push("/vendor/dashboard")}
                                className="button-orange px-4 py-2 text-sm"
                            >
                                Open Vendor Dashboard
                            </button>
                        )}

                        {user?.role === "admin" && (
                            <button
                                onClick={() => Router.push("/admin/dashboard")}
                                className="button-orange px-4 py-2 text-sm"
                            >
                                Open Admin Dashboard
                            </button>
                        )}
                    </div>
                    {message && <p className="text-sm text-slate-600 mt-3">{message}</p>}
            </div>
            </Layout>
        </>
    );
};

export default Profile;

export async function getServerSideProps(context: any) {
    db.connectDb();
    const { query } = context;
    const session = await getSession(context);
    const user = session?.user;
    const tab = query.tab || 0;

    if (!session) {
        return {
            redirect: {
                destination: "/",
            },
        };
    }

    return {
        props: {
            user,
            tab,
        },
    };
}
