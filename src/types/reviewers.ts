export type AssignedArea = 
  | "CIVIL Y NOTARIADO"
  | "ADMINISTRATIVO"
  | "COMERCIAL Y DE CONSUMO"
  | "LABORAL Y SEGUROS"
  | "FAMILIA Y SUCESIONES"
  | "JUZGADOS ESPECIALES";

export interface Reviewers {
  id: string;
  name: string;
  email: string;
  user_type: string;
  queries_number: string;
  procceses_number: string;
  assigned_areas: AssignedArea[];
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
  
  export type ReviewerWithKey = Reviewers & { key: string };
