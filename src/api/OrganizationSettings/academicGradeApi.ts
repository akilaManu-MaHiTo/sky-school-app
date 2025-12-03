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

export async function getGradesData() {
  const res = await axios.get(`/api/grade`);
  return res.data;
}
export const createAcademicGrade = async (academicGrade: AcademicGrade) => {
  const res = await axios.post(`/api/grade`, academicGrade);
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