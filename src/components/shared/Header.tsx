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
  "create-office-case": "Crear Caso Consultorio Jurídico",
  "create-conciliation-case": "Crear Caso Conciliación",
  users: "Usuarios",
  grades: "Calificaciones",
  edit: "Editar",
};

function getRoleColor(
  userRole: string | null
): "primary" | "success" | "default" | "danger" | "warning" {
  if (!userRole) return "default";

  switch (userRole) {
    case "Director":
      return "primary";
    case "Docente":
      return "success";
    case "Estudiante":
      return "primary";
    case "Monitor":
      return "warning";
    default:
      return "default";
  }
}

export default function Header() {
  const { userName, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbItems = useMemo(() => {
    const paths = pathname?.split("/").filter(Boolean) || [];
    const items = [];

    items.push({
      label: "Inicio",
      href: "/",
      isCurrent: pathname === "/",
    });

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

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
                className="transition-transform"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat" disabledKeys={["settings", "help_and_feedback"]}>
              <DropdownItem key="profile" className="h-14 gap-2">
                <Chip
                  size="sm"
                  color={getRoleColor(userRole)}
                  variant="flat"
                  className="hidden sm:flex mr-2"
                >
                  {userRole}
                </Chip>
                <p className="font-bold">
                  {userName}
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
