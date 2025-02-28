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
import { usePathname } from "next/navigation";
import Link from "next/link";

export const NAV_LINKS = [
  { href: "/dashboard", key: "dashboard", label: "Dashboard", icon: ChartPieIcon },
  {
    href: "/dashboard/cases",
    key: "cases",
    label: "Casos",
    icon: ClipboardDocumentListIcon,
  },
  { href: "/dashboard/mails", key: "mails", label: "Correos", icon: EnvelopeIcon },
  { href: "/dashboard/citizens", key: "citizens", label: "Ciudadanos", icon: UsersIcon },
  { href: "/dashboard/users", key: "users", label: "Usuarios", icon: UserGroupIcon },
  {
    href: "/dashboard/reviewers",
    key: "reviewers",
    label: "Revisores",
    icon: MagnifyingGlassCircleIcon,
  },
  { href: "/dashboard/accounts", key: "accounts", label: "Cuentas", icon: UserIcon },
  { href: "/dashboard/crm", key: "crm", label: "CRM", icon: Squares2X2Icon },
  {
    href: "/dashboard/config",
    key: "config",
    label: "Configuración",
    icon: Cog6ToothIcon,
  },
];

interface NavLinksProps {
  handleMouseEnter: React.MouseEventHandler<HTMLAnchorElement>;
  isHovered: boolean;
}

export function NavLinks({ handleMouseEnter, isHovered }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.slice(0, 6).map((menu) => {
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
