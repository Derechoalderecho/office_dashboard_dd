import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  UserGroupIcon,
  UsersIcon,
  MagnifyingGlassCircleIcon,
  UserIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { addToast } from "@heroui/react";

export const NAV_LINKS = [
  /*{ href: "/dashboard", key: "dashboard", label: "Dashboard", icon: ChartPieIcon, enabled: true },*/
  {
    href: "/dashboard/cases",
    key: "cases",
    label: "Casos",
    icon: ClipboardDocumentListIcon,
    enabled: true,
  },
  /*{ href: "/dashboard/mails", key: "mails", label: "Correos", icon: EnvelopeIcon, enabled: false },*/
  { href: "/dashboard/citizens", key: "citizens", label: "Ciudadanos", icon: UsersIcon, enabled: true },
  { href: "/dashboard/users", key: "users", label: "Usuarios", icon: UserGroupIcon, enabled: true },
/*
  {
    href: "/dashboard/reviewers",
    key: "reviewers",
    label: "Revisores",
    icon: MagnifyingGlassCircleIcon,
    enabled: false,
  },

  { href: "/dashboard/accounts", key: "accounts", label: "Cuentas", icon: UserIcon, enabled: false },
  { href: "/dashboard/crm", key: "crm", label: "CRM", icon: Squares2X2Icon, enabled: false },
  {
    href: "/dashboard/config",
    key: "config",
    label: "Configuración",
    icon: Cog6ToothIcon,
    enabled: false,
  },
    */
];

interface NavLinksProps {
  handleMouseEnter: React.MouseEventHandler<HTMLAnchorElement>;
  isHovered: boolean;
}

export function NavLinks({ handleMouseEnter, isHovered }: NavLinksProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, menu: typeof NAV_LINKS[0]) => {
    if (!menu.enabled) {
      e.preventDefault();
      addToast({
        title: "Página no habilitada",
        description: `La página ${menu.label} aún no está habilitada.`,
        color: "primary",
      });
    }
  };
  
  return (
    <>
      {NAV_LINKS.slice(0, 6).map((menu) => {
        const Icon = menu.icon;
        return (
          <Link
            key={menu.key}
            href={menu.href}
            onClick={(e) => handleNavClick(e, menu)}
            className={`flex font-medium gap-4 items-center px-3 py-3 rounded-xl transition-all ${
              pathname === menu.href
                ? "text-primary bg-bgNav"
                : !menu.enabled
                ? "text-gray-400 pointer-events-auto cursor-not-allowed"
                : "text-secondary hover:bg-[#D4EAFF]"
            }`}
            onMouseEnter={handleMouseEnter}
          >
            <div>
              <Icon className="size-6" />
            </div>
            <span
              className={`overflow-hidden text-ellipsis ${
                isHovered ? "block text-nowrap" : "hidden"
              }`}
            >
              {menu.label}
              {!menu.enabled && isHovered && (
                <span className="ml-1 text-xs text-gray-400">(Deshabilitado)</span>
              )}
            </span>
          </Link>
        );
      })}
    </>
  );
}

/*
export function NavLinks2({ handleMouseEnter, isHovered }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.slice(6, 9).map((menu) => {
        const Icon = menu.icon;
        return (
          <Link
            key={menu.key}
            href={menu.href}
            className={`flex font-medium gap-4 items-center px-3 py-3 rounded-xl transition-all ${
              pathname === menu.href
                ? "text-primary bg-bgNav"
                : "text-secondary hover:bg-[#D4EAFF]"
            }`}
            onMouseEnter={handleMouseEnter}
          >
            <div>
              <Icon className="size-6" />
            </div>
            <span
              className={`overflow-hidden text-ellipsis ${
                isHovered ? "block text-nowrap" : "hidden"
              }`}
            >
              {menu.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}
  */
