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
  site: string;
}

export type ReviewerWithKey = Reviewers & { key: string };
