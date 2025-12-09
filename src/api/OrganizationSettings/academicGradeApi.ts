import axios from "axios";
import { stat } from "fs";
import { z } from "zod";

export const AcademicGradeSchema = z.object({
  id: z.number(),
  grade: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AcademicGrade = z.infer<typeof AcademicGradeSchema>;

export const AcademicYearSchema = z.object({
  id: z.number(),
  year: z.string(),
  createdAt: z.date(),
  isFinishedYear: z.boolean(),
  status: z.string(),
  updatedAt: z.date(),
});
export type AcademicYear = z.infer<typeof AcademicYearSchema>;

export const SubjectSchema= z.object({
  id: z.number(),
  subjectName: z.string(),
  subjectCode: z.string(),
  isBasketSubject: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  subjectMedium: z.string()
});
export type AcademicSubject= z.infer<typeof SubjectSchema>;

export const ClassSchema = z.object({
  id: z.number(),
  className: z.string(),
  gradeId: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AcademicClass = z.infer<typeof ClassSchema>;

export async function getGradesData() {
  const res = await axios.get(`/api/grade`);
  return res.data;
}
export const createAcademicGrade = async (academicGrade: AcademicGrade) => {
  const res = await axios.post(`/api/grade`, academicGrade);
  return res.data;
}
export const updateAcademicGrade = async (academicGrade: AcademicGrade) => {
  const res = await axios.post(`/api/grade/${academicGrade.id}`, academicGrade);
  return res.data;
}
export const deleteAcademicGrade = async (id: String) => {
  const res = await axios.delete(`/api/grade/${id}`);
  return res.data;
}

export const createAcademicYear = async (academicYear: AcademicYear) => {
  const res = await axios.post(`/api/year`, academicYear);
  return res.data;
}
export const updateAcademicYear = async (academicYear: AcademicYear) => {
  const res = await axios.post(`/api/year/${academicYear.id}`, academicYear);
  return res.data;
}
export const deleteAcademicYear = async (id: String) => {
  const res = await axios.delete(`/api/year/${id}`);
  return res.data;
}

export const createAcademicSubject = async (academicSubject: AcademicSubject) => {
  const res = await axios.post(`/api/subject`, academicSubject);
  return res.data;
}
export const updateAcademicSubject = async (academicSubject: AcademicSubject) => {
  const res = await axios.post(`/api/subject/${academicSubject.id}`, academicSubject);
  return res.data;
}
export const deleteAcademicSubject = async (id: String) => {
  const res = await axios.delete(`/api/subject/${id}`);
  return res.data;
}

export async function getClassesData() {
  const res = await axios.get(`/api/class`);
  return res.data;
}

export const createAcademicClass = async (academicClass: AcademicClass) => {
  const res = await axios.post(`/api/class`, academicClass);
  return res.data;
}

export const updateAcademicClass = async (academicClass: AcademicClass) => {
  const res = await axios.post(`/api/class/${academicClass.id}` , academicClass);
  return res.data;
}

export const deleteAcademicClass = async (id: String) => {
  const res = await axios.delete(`/api/class/${id}`);
  return res.data;
}