import Layout from "@/components/admin/layout/Layout";
import { requirePortalSession } from "@/utils/portalAuth";

const AdminSettingsPage = () => {
    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-3xl space-y-4">
                <h1 className="text-2xl font-bold text-vendora-ink">Ajustes</h1>
                <div className="bg-white border rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700">Configuracion general del panel de administracion.</p>
                    <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span className="text-sm">Notificaciones por correo</span>
                        <input type="checkbox" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span className="text-sm">Mostrar metricas avanzadas</span>
                        <input type="checkbox" defaultChecked />
                    </label>
                    <button className="bg-vendora-accent text-white px-4 py-2 rounded-md hover:opacity-90">
                        Guardar ajustes
                    </button>
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

    return { props: {} };
}

export default AdminSettingsPage;
