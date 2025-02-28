export type DocumentType = "CC" | "CE" | "TI" | "NIT" | "NIT" | "NIT" | "NIT";

export type Sex =
  | "Femenino"
  | "Masculino"
  | "Intersexual"
  | "Prefiero no responder";

export type Gender =
  | "Mujer"
  | "Hombre"
  | "No binario"
  | "Género fluido"
  | "Transgénero"
  | "Otro"
  | "Prefiero no responder";

export type CivilStatus = "Soltero(a)" | "Casado(a)" | "Unión libre";

export type SchoolLevel =
  | "Primaria"
  | "Bachillerato"
  | "Técnico"
  | "Profesional"
  | "Postgrado"
  | "Maestría"
  | "Doctorado"
  | "Ninguno";

export type SexualOrientation =
  | "Heterosexual"
  | "Homosexual"
  | "Bisexual"
  | "Prefiere no responder";

export type Ethnicity =
  | "Ninguno"
  | "Afrocolombiano(a), Negro(a) o Mulato(a)"
  | "Indígena"
  | "Rom (Gitano)"
  | "Palenquero(a)"
  | "Mestizo(a) o Blanco(a)";

export type Disability = "Visual" | "Auditiva" | "Física" | "Ninguno";

export type KnowWriteAndRead = "Si" | "No";

export interface Citizen {
  id: string;
  first_name: string;
  second_name?: string;
  first_lastname: string;
  second_lastname?: string;
  document_type: DocumentType;
  document_number: string;
  site: string;
  email: string;
  fixed_phone: string;
  mobile_phone: string;
  dane_address: string;
  created_at: string;
  updated_at: string;
  sex: Sex;
  gender: Gender;
  born_date: string;
  sexual_orientation: SexualOrientation;
  nationality: string;
  civil_status: CivilStatus;
  school_level: SchoolLevel;
  ethnicity: Ethnicity;
  disability: Disability;
  know_write_and_read: KnowWriteAndRead;
  actions?: string;
  key?: string;
}

export type CitizenWithKey = Citizen & { key: string };
