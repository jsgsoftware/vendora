import VendorLayout from "@/components/vendor/layout/Layout";
import { getVendorPageProps } from "@/utils/vendorPortalSSR";

const VendorSettingsPage = () => {
    return (
        <VendorLayout title="Ajustes">
            <div className="max-w-3xl space-y-4">
                <div className="bg-white border rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700">Configura opciones de tu panel vendedor.</p>
                    <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span className="text-sm">Recibir alertas de nuevos pedidos</span>
                        <input type="checkbox" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between border rounded-md px-3 py-2">
                        <span className="text-sm">Mostrar reseñas en dashboard</span>
                        <input type="checkbox" defaultChecked />
                    </label>
                    <button className="bg-vendora-accent text-white px-4 py-2 rounded-md hover:opacity-90">
                        Guardar ajustes
                    </button>
                </div>
            </div>
        </VendorLayout>
    );
};

export const getServerSideProps = getVendorPageProps;

export default VendorSettingsPage;
