export type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

export type StatusOption = {
  name: string;
  uid: string;
};

export type userTypeOption = {
  name: string;
  uid: string;
};

export type siteOption = {
  name: string;
  uid: string;
};

export type RangeValue<T> = { start: T; end: T };

export type DateRange = {
  start: { year: number; month: number; day: number };
  end: { year: number; month: number; day: number };
};
