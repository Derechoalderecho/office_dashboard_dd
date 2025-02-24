import { SideBar } from "@/components/shared/SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex">
      <SideBar />
      {children}
    </main>
  );
}
