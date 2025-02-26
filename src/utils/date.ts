export const parseDateToLocal = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
