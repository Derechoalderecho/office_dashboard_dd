"use client";

import { Button, addToast, toast } from "@heroui/react";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { refreshDashboardData } from "@/services/dashboardService";

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await refreshDashboardData();
      
      if (success) {
        addToast({
          title: "Datos actualizados",
          description: "Los datos del dashboard se han actualizado correctamente",
          color: "default",
        });
        
        // Recargar la página para mostrar los nuevos datos
        window.location.reload();
      } else {
        addToast({
          title: "Error al actualizar",
          description: "No se pudieron actualizar los datos. Intente de nuevo.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al refrescar datos:", error);
      
      addToast({
        title: "Error inesperado",
        description: "Ocurrió un error al actualizar los datos.",
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="bordered"
      size="sm"
      onPress={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>{isRefreshing ? 'Actualizando...' : 'Actualizar datos'}</span>
    </Button>
  );
} 