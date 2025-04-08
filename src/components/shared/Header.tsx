import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  Divider,
  Chip,
} from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";

const pathTranslations: { [key: string]: string } = {
  dashboard: "Dashboard",
  cases: "Casos",
  citizens: "Ciudadanos",
  create: "Crear Ciudadano",
  users: "Usuarios",
  new: "Nuevo",
  califications: "Calificaciones",
  edit: "Editar",
  view: "Ver",
  reports: "Reportes",
  notifications: "Notificaciones",
  help: "Ayuda",
};

export default function Header() {
  const { user, role } = useAuth();
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
      <header className="flex items-center justify-between w-full py-4">
        <Breadcrumbs
          itemClasses={{
            separator: "px-2",
            item: "text-default-500 hover:text-primary",
            base: "gap-1",
          }}
          separator="/"
        >
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem
              key={item.href}
              isCurrent={item.isCurrent}
              className={item.isCurrent ? "text-primary font-medium" : ""}
            >
              <Link href={item.href}>{item.label}</Link>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
        <div className="flex items-center gap-4">
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
                <Chip size="sm" className="text-sm text-gray-500 my-2">
                  {role}
                </Chip>
                <p className="font-bold">
                  {user && (user.displayName || user.email)}
                </p>
              </DropdownItem>
              <DropdownItem key="settings">Configuración</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Ayuda y mejora
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
      <Divider className="mb-7" />
    </>
  );
}
