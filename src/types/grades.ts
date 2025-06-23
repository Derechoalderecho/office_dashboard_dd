export interface Grade {
  id_caso: number;
  id_estudiante: number;
  id_docente: number;
  criterio_1: number;
  criterio_2: number;
  criterio_3: number;
  criterio_4: number;
  id_calificaciones_caso: number;
  created_date: string;
  modified_date: string;
  deleted_at: string | null;
  status: boolean;
  promedio: number;
}

export interface GradesResponse {
  data: Grade[];
}

export interface GradesByCaseParams {
  id_caso: number;
}

export interface GradesByStudentParams {
  id_estudiante: number;
}

export interface GradesByTeacherParams {
  id_docente: number;
}

export interface CreateGradeParams {
  id_caso: number;
  id_estudiante: number;
  id_docente: number;
  criterio_1: number;
  criterio_2: number;
  criterio_3: number;
  criterio_4: number;
}

export interface UpdateGradeParams {
  criterio_1: number;
  criterio_2: number;
  criterio_3: number;
  criterio_4: number;
  ganado: boolean;
}