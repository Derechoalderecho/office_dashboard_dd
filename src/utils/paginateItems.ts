export const paginateItems = <T>(
    items: T[],
    page: number,
    rowsPerPage: number
  ): T[] => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  };