import Layout from "@/components/admin/layout/Layout";
import User from "@/models/User";
import { requirePortalSession } from "@/utils/portalAuth";

const UsersPage = ({ users }: any) => {
    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-4">
                <h1 className="text-2xl font-bold text-vendora-ink">Users</h1>
                <div className="overflow-auto border rounded-lg bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Role</th>
                                <th className="p-3 text-left">Store Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u._id} className="border-t">
                                    <td className="p-3">{u.name || "-"}</td>
                                    <td className="p-3">{u.email || "-"}</td>
                                    <td className="p-3 capitalize">{u.role || "user"}</td>
                                    <td className="p-3 capitalize">{u.vendorRequest?.status || "none"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps(context: any) {
    const auth = await requirePortalSession(context, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    const users = await User.find({}).sort({ updatedAt: -1 }).lean();
    return {
        props: {
            users: JSON.parse(JSON.stringify(users)),
        },
    };
}

export default UsersPage;
