export interface Citizen {
  id: string;
  first_name: string;
  second_name: string;
  first_lastname: string;
  second_lastname: string;
  document_type: string;
  document_number: string;
  email: string;
  fixed_phone: string;
  mobile_phone: string;
  dane_address: string;
  created_at: string;
  updated_at: string;
  sex: string;
  gender: string;
  born_date: string;
  sexual_orientation: string;
  nationality: string;
  civil_status: string;
  school_level: string;
  ethnicity: string;
  disability: string;
  know_write_and_read: string;
  actions?: string;
  key?: string;
}

export type CitizenWithKey = Citizen & { key: string };
