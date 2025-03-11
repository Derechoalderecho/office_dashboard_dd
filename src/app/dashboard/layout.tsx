"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SideBar } from "@/components/shared/SideBar";
import Header from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="flex">
          <SideBar />
          <section className="flex flex-col w-full h-full px-6 mx-auto ml-16 pb-10">
            <Header />
            <main className="p-4">{children}</main>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
