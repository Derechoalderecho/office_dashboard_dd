export const parseDateToLocal = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export const parseDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const parseTime = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};
