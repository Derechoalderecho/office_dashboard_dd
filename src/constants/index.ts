/*import {
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
 */

export const COLUMNS = [
  { name: "Creado en", uid: "created" },
  { name: "Actualizado en", uid: "update" },
  { name: "Tipo de proceso", uid: "proccess_type", sortable: true },
  { name: "Estado", uid: "status", sortable: true },
  { name: "Cliente", uid: "name" },
  { name: "Tiempo Respuesta", uid: "response_time", sortable: true },
  { name: "Asignado", uid: "assigned", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const STATUS_OPTIONS = [
  { name: "Seguimiento", uid: "follow_up" },
  { name: "Aprobado", uid: "aproved" },
  { name: "No Aprobado", uid: "not_approved" },
  { name: "Acción Necesaria", uid: "action_required" },
];
