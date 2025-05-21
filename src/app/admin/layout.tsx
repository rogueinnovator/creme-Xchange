import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { SessionProvider } from "next-auth/react";
import React from "react";
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <div className="flex bg-white max-h-screen overflow-y-hidden">
        <Sidebar />
        <div className="overflow-y-auto w-full">
          <main className="flex-1 p-3  ">
            <div className="bg-[#EFF9FF] p-6 rounded-4xl shadow space-y-5">
              <Navbar />

              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
};

export default AdminLayout;
