import { useState } from "react";
import { addToast } from "@heroui/react";

export const useDeleteRows = (
  onDeleteRows: (ids: number[]) => Promise<boolean>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (selectedKeys: Set<number> | "all", onComplete?: () => void) => {
    try {
      setIsLoading(true);
      let success = false;
      
      if (selectedKeys === "all") {
        success = await onDeleteRows([]);
      } else if (selectedKeys.size > 0) {
        const caseIds = Array.from(selectedKeys).map((key) => Number(key));
        success = await onDeleteRows(caseIds);
      }

      if (success) {
        addToast({
          title: "Operación completada",
          description: "Los casos han sido eliminados correctamente",
          color: "success",
        });
      } else {
        addToast({
          title: "Error en la operación",
          description: "No se pudieron eliminar algunos o todos los casos. Revise la consola para más detalles.",
          color: "danger",
        });
        return false;
      }
    } catch (error) {
      console.error("Error en la operación de eliminación:", error);
      addToast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al procesar la solicitud. Por favor, inténtelo de nuevo.",
        color: "danger",
      });
      return false;
    } finally {
      setIsLoading(false);
      if (onComplete) onComplete();
    }
    return true;
  };

  return { handleDelete, isLoading };
};
