export const getDeleteAlertMessageCases = (selectedKeys: Set<number> | "all") => {
    return selectedKeys === "all"
      ? "¿Estás seguro de que deseas eliminar todos los casos?"
      : `¿Estás seguro de que deseas eliminar ${selectedKeys.size} caso(s)?`;
  };