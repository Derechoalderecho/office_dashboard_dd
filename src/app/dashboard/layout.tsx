import { SideBar } from "@/components/shared/SideBar";
import Header from "@/components/shared/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SideBar />
      <section className="flex flex-col w-full h-full px-6 mx-auto ml-16 pb-10">
        <Header />
        {children}
      </section>
    </div>
  );
}
