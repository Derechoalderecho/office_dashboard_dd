export interface Assigned {
  name: string;
  avatar: string;
}

export interface RegistrationHistory {
  status: string;
  date: string;
}

export interface Cases {
  id: string;
  proccess_type: string;
  created: string;
  update: string;
  id_document: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  response_time: string;
  register_number: string;
  assigned: Assigned;
  registration_history: RegistrationHistory[];
  history_comments: any[];
  actions?: string;
}

export type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

export type StatusOption = {
  name: string;
  uid: string;
};

export type RangeValue<T> = { start: T; end: T };

export type DateRange = {
  start: { year: number; month: number; day: number };
  end: { year: number; month: number; day: number };
};
