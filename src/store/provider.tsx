"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/react";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Verificar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={null} persistor={persistor}>
          <HeroUIProvider>
            <ToastProvider />
            {children}
          </HeroUIProvider>
        </PersistGate>
      ) : (
        <HeroUIProvider>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      )}
    </Provider>
  );
}
