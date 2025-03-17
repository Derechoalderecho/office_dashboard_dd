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
          title: "Casos eliminados correctamente",
          description: "Los casos han sido eliminados correctamente",
          color: "success",
        });
      } else {
        throw new Error("Error al eliminar los casos");
      }
    } catch (error) {
      addToast({
        title: "Error al eliminar los casos",
        description: "Ha ocurrido un error al eliminar los casos",
        color: "danger",
      });
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
      if (onComplete) onComplete();
    }
    return true;
  };

  return { handleDelete, isLoading };
};
