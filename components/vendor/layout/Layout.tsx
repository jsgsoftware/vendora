import Sidebar from "../sidebar/Sidebar";

const VendorLayout = ({ children, title = "Vendor Dashboard" }: any) => {
    return (
        <div className="min-h-screen bg-vendora-soft">
            <div className="max-w-screen-2xl mx-auto grid md:grid-cols-[260px_1fr] gap-4 p-3 md:p-6">
                <Sidebar />
                <div className="bg-vendora-surface rounded-xl border border-vendora p-4 md:p-6">
                    <h1 className="text-2xl font-semibold mb-4 text-vendora-ink">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default VendorLayout;
