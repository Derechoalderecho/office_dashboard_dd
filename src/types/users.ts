export interface Users {
  id: string;
  id_document: string;
  name: string;
  user_type: string;
  branch_law: string;
  site: string;
  email: string;
  active_consults: string;
  active_processes: string;
  consults_calification: string;
  processes_calification: string;
  is_active: boolean;
  actions?: string;
  key?: string;
}

export type UserWithKey = Users & { key: string };
