import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <HeroUIProvider>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
