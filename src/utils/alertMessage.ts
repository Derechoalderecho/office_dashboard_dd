export const getDeleteAlertMessage = (
  selectedKeys: Set<number> | "all",
  type: "caso" | "archivo" | "ciudadano" | "usuario" | "asignado"
) => {
  return selectedKeys === "all"
    ? `¿Estás seguro de que deseas eliminar todos los ${type}s?`
    : `¿Estás seguro de que deseas eliminar ${selectedKeys.size} ${type}(s)?`;
};
