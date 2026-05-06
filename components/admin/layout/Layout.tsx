import Sidebar from "../sidebar/Sidebar";

const Layout = ({ children }: any) => {
    return (
        <div className="flex min-h-screen bg-vendora-soft">
            <Sidebar />
            <div className="w-full pb-20 text-vendora-ink md:pb-0 md:pl-8">{children}</div>
        </div>
    );
};

export default Layout;
