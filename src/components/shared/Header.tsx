import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@heroui/react";
import LogoutButton from '@/components/auth/LogoutButton';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between w-full py-4">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            }}
            className="transition-transform"
            name={`Eduardo`}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" variant="flat">
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-bold">Ingresaste como</p>
            <p className="font-bold">Sanclemente</p>
          </DropdownItem>
          <DropdownItem key="settings">Configuración</DropdownItem>
          <DropdownItem key="help_and_feedback">Ayuda y mejora</DropdownItem>
          <DropdownItem key="logout" color="danger">
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user.displayName || user.email}</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
