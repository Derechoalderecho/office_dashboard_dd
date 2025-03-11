import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  Divider,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";

const pathTranslations: { [key: string]: string } = {
  dashboard: "Dashboard",
  cases: "Casos",
  ciudadanos: "Ciudadanos",
  settings: "Configuración",
  profile: "Perfil",
  users: "Usuarios",
  new: "Nuevo",
  edit: "Editar",
  view: "Ver",
  reports: "Reportes",
  notifications: "Notificaciones",
  help: "Ayuda",
};

export default function Header() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbItems = useMemo(() => {
    const paths = pathname?.split("/").filter(Boolean) || [];
    const items = [];

    // Always add home
    items.push({
      label: "Inicio",
      href: "/",
      isCurrent: pathname === "/",
    });

    // Build the breadcrumb path
    let currentPath = "";
    paths.forEach((path) => {
      currentPath += `/${path}`;
      // Use the translation if it exists, otherwise format the path
      const translatedLabel =
        pathTranslations[path.toLowerCase()] ||
        path
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      items.push({
        label: translatedLabel,
        href: currentPath,
        isCurrent: currentPath === pathname,
      });
    });

    return items;
  }, [pathname]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between w-full py-5">
        <Breadcrumbs
          itemClasses={{
            separator: "px-2",
          }}
          separator="/"
        >
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={item.href} isCurrent={item.isCurrent}>
              <Link href={item.href}>{item.label}</Link>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <Avatar
              as="button"
              radius="sm"
              size="sm"
              isBordered
              src={
                user?.photoURL ||
                "https://i.pravatar.cc/150?u=a042581f4e29026024d"
              }
              className="transition-transform"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold">Ingresaste como</p>
              <p className="font-bold">
                {user && (user.displayName || user.email)}
              </p>
            </DropdownItem>
            <DropdownItem key="settings">Configuración</DropdownItem>
            <DropdownItem key="help_and_feedback">Ayuda y mejora</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
              {loading ? "Cerrando sesión..." : "Cerrar sesión"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </header>
      <Divider className="mb-7" />
    </>
  );
}
