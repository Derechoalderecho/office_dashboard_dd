"use server";

import { get, post, put } from '../utils/apiUtils';
import { Grade, GradesByCaseParams, GradesByStudentParams, GradesByTeacherParams, CreateGradeParams, UpdateGradeParams } from '../types/grades';

// Obtener todas las calificaciones
function getAllGrades(): Promise<Grade[]> {
  return get<Grade[]>('calificaciones/');
}

// Obtener calificaciones por caso
function getGradesByCase({ id_caso }: GradesByCaseParams): Promise<Grade[]> {
  return get<Grade[]>(`calificaciones/caso/${id_caso}`);
}

// Obtener calificaciones por estudiante
function getGradesByStudent({ id_estudiante }: GradesByStudentParams): Promise<Grade[]> {
  return get<Grade[]>(`calificaciones/estudiante/${id_estudiante}`);
}

// Obtener calificaciones por docente
function getGradesByTeacher({ id_docente }: GradesByTeacherParams): Promise<Grade[]> {
  return get<Grade[]>(`calificaciones/docente/${id_docente}`);
}

// Crear una calificación
function createGrade(gradeData: CreateGradeParams): Promise<Grade> {
  return post<Grade>('calificaciones/', gradeData);
}

// Actualizar una calificación
function updateGrade(id: number, gradeData: UpdateGradeParams): Promise<Grade> {
  return put<Grade>(`calificaciones/${id}`, gradeData);
}

export const gradesService = {
  getAllGrades,
  getGradesByCase,
  getGradesByStudent,
  getGradesByTeacher,
  createGrade,
  updateGrade
};