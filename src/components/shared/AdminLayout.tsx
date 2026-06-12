import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div
                className="
          flex-1
          flex flex-col
          w-full
          md:ms-64
          transition-all duration-300
        "
            >
                {/* Topbar */}
                <Topbar />

                {/* Page Content */}
                <main className="flex-1 p-3 sm:p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
