import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  UserGroupIcon,
  UsersIcon,
  MagnifyingGlassCircleIcon,
  UserIcon,
  Squares2X2Icon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

export const NAV_LINKS = [
    { href: "/", key: "dashboard", label: "Dashboard", icon: <ChartPieIcon className="size-6" /> },
    { href: "/cases", key: "cases", label: "Casos", icon: <ClipboardDocumentListIcon className="size-6" /> },
    { href: "/mails", key: "mails", label: "Correos", icon: <EnvelopeIcon className="size-6" /> },
    { href: "/citizens", key: "citizens", label: "Ciudadanos", icon: <UsersIcon className="size-6" /> },
    { href: "/users", key: "users", label: "Usuarios", icon: <UserGroupIcon className="size-6" /> },
    { href: "/reviewers", key: "reviewers", label: "Revisores", icon: <MagnifyingGlassCircleIcon className="size-6" /> },
    { href: "/accounts", key: "accounts", label: "Cuentas", icon: <UserIcon className="size-6" /> },
    { href: "/crm", key: "crm", label: "CRM", icon: <Squares2X2Icon className="size-6" /> },
    { href: "/config", key: "config", label: "Configuración", icon: <Cog6ToothIcon className="size-6" /> },
];
