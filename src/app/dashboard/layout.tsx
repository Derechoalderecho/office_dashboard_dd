"use client";

import { useState } from "react";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SideBar } from "@/components/shared/SideBar";
import Header from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="flex">
          <SideBar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
          <section 
            className={`flex flex-col w-full h-full px-6 mx-auto pb-10 
              transition-[margin] duration-300 ease-in-out`}
          >
            <Header onExpandSidebar={() => setIsSidebarExpanded(true)} isSidebarExpanded={isSidebarExpanded} />
            <main className="p-4">{children}</main>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
